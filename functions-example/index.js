/**
 * Firebase Cloud Functions para Sistema de Embed
 * 
 * Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

admin.initializeApp();

/**
 * Gerar URL assinada para embed seguro
 * 
 * Uso no frontend:
 * const signUrl = functions.httpsCallable('signEmbedUrl');
 * const result = await signUrl({ url, discipline });
 */
exports.signEmbedUrl = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    const { url, discipline } = data;
    const userId = context.auth.uid;

    // Validar entrada
    if (!url || !discipline) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'URL e disciplina são obrigatórios'
        );
    }

    // Validar formato da URL
    try {
        new URL(url);
    } catch (e) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'URL inválida'
        );
    }

    // Buscar configuração da disciplina
    const configSnapshot = await admin.firestore()
        .collection('embedConfigs')
        .doc(discipline)
        .get();

    if (!configSnapshot.exists) {
        throw new functions.https.HttpsError(
            'not-found',
            'Configuração da disciplina não encontrada'
        );
    }

    const config = configSnapshot.data();

    // Verificar se requer autenticação
    if (!config.requiresAuth) {
        // Retornar URL original se não precisa de token
        return { signedUrl: url };
    }

    // Gerar token JWT
    const expiresIn = 3600; // 1 hora
    const jwtSecret = process.env.JWT_SECRET || functions.config().jwt.secret;

    const token = jwt.sign(
        {
            userId,
            discipline,
            originalUrl: url,
            type: config.type,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + expiresIn
        },
        jwtSecret,
        { algorithm: 'HS256' }
    );

    // Adicionar token à URL
    const urlObj = new URL(url);
    urlObj.searchParams.set('auth_token', token);
    urlObj.searchParams.set('user_id', userId);

    // Registrar analytics
    await logEmbedAnalytics({
        event: 'url_signed',
        userId,
        discipline,
        url,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
        signedUrl: urlObj.toString(),
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    };
});

/**
 * Verificar token de embed
 */
exports.verifyEmbedToken = functions.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { token } = req.body;

    if (!token) {
        res.status(400).json({ error: 'Token é obrigatório' });
        return;
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || functions.config().jwt.secret;
        const decoded = jwt.verify(token, jwtSecret);

        res.status(200).json({
            valid: true,
            userId: decoded.userId,
            discipline: decoded.discipline,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
    } catch (error) {
        res.status(401).json({
            valid: false,
            error: 'Token inválido ou expirado'
        });
    }
});

/**
 * Registrar eventos de analytics do embed
 */
exports.logEmbedAnalytics = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    const { event, properties } = data;
    const userId = context.auth.uid;

    await logEmbedAnalytics({
        event,
        userId,
        ...properties,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
});

/**
 * Helper para salvar analytics
 */
async function logEmbedAnalytics(data) {
    try {
        await admin.firestore()
            .collection('embedAnalytics')
            .add(data);
    } catch (error) {
        console.error('Erro ao salvar analytics:', error);
    }
}

/**
 * Trigger: quando um exercício é completado via embed
 */
exports.onExerciseCompleted = functions.firestore
    .document('embedAnalytics/{analyticsId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        if (data.event !== 'exercise_completed') {
            return;
        }

        // Atualizar progresso do usuário
        const { userId, discipline, exerciseId, score } = data;

        try {
            const progressRef = admin.firestore()
                .collection('progress')
                .doc(`${userId}_exercises`);

            await progressRef.set(
                {
                    [`${discipline}.${exerciseId}`]: {
                        score,
                        completedAt: admin.firestore.FieldValue.serverTimestamp(),
                        attempts: admin.firestore.FieldValue.increment(1)
                    }
                },
                { merge: true }
            );

            console.log(`Progresso atualizado: ${userId} - ${discipline} - ${exerciseId}`);
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        }
    });

/**
 * Limpar analytics antigos (executar mensalmente)
 */
exports.cleanupOldAnalytics = functions.pubsub
    .schedule('0 0 1 * *') // Todo dia 1 às 00:00
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const snapshot = await admin.firestore()
            .collection('embedAnalytics')
            .where('timestamp', '<', threeMonthsAgo)
            .limit(500)
            .get();

        const batch = admin.firestore().batch();
        let count = 0;

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            count++;
        });

        if (count > 0) {
            await batch.commit();
            console.log(`${count} registros de analytics removidos`);
        }

        return null;
    });

/**
 * Validar configuração de embed antes de salvar
 */
exports.validateEmbedConfig = functions.firestore
    .document('embedConfigs/{discipline}')
    .onWrite(async (change, context) => {
        if (!change.after.exists) {
            // Documento deletado
            return;
        }

        const config = change.after.data();
        const errors = [];

        // Validações
        if (!config.url || !isValidUrl(config.url)) {
            errors.push('URL inválida');
        }

        if (!config.title) {
            errors.push('Título é obrigatório');
        }

        if (!['notebook', 'video', 'page', 'app'].includes(config.type)) {
            errors.push('Tipo inválido');
        }

        // Se houver erros, reverter
        if (errors.length > 0) {
            console.error('Configuração inválida:', errors);
            
            // Notificar admin (enviar email, etc)
            // await sendAdminNotification(errors);
            
            if (!change.before.exists) {
                // Novo documento inválido, deletar
                await change.after.ref.delete();
            } else {
                // Restaurar versão anterior
                await change.after.ref.set(change.before.data());
            }
        }
    });

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Endpoint para reportar problemas
 */
exports.reportEmbedProblem = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    const { url, discipline, description, userAgent } = data;
    const userId = context.auth.uid;

    // Salvar problema reportado
    await admin.firestore()
        .collection('embedProblems')
        .add({
            userId,
            url,
            discipline,
            description,
            userAgent,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });

    // Notificar equipe (email, Slack, etc)
    // await notifyTeam({ userId, url, discipline, description });

    return { success: true, message: 'Problema reportado com sucesso' };
});
