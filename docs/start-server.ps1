<#
  Simple static file server in PowerShell using HttpListener.
  Usage: run from the `docs` folder with PowerShell or call via `start-server.bat`.
  Serves files from the script directory on http://localhost:8000/
#>

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $scriptDir

$port = 8000
$prefix = "http://localhost:$port/"

Write-Host "Starting PowerShell static server for folder:`n  $scriptDir`nListening on: $prefix" -ForegroundColor Green

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = 'index.html' }

        # Prevent path traversal
        $safePath = $rawPath -replace '\\.\./', '' -replace '\\..\\', ''
        $filePath = Join-Path $scriptDir $safePath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                '.html' { $mime = 'text/html; charset=utf-8' }
                '.htm'  { $mime = 'text/html; charset=utf-8' }
                '.css'  { $mime = 'text/css' }
                '.js'   { $mime = 'application/javascript' }
                '.json' { $mime = 'application/json' }
                '.png'  { $mime = 'image/png' }
                '.jpg'  { $mime = 'image/jpeg' }
                '.jpeg' { $mime = 'image/jpeg' }
                '.svg'  { $mime = 'image/svg+xml' }
                '.md'   { $mime = 'text/markdown; charset=utf-8' }
                '.txt'  { $mime = 'text/plain; charset=utf-8' }
                default { $mime = 'application/octet-stream' }
            }

            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Close()
        }
        else {
            $response.StatusCode = 404
            $msg = "404 Not Found: $rawPath"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.ContentType = 'text/plain; charset=utf-8'
            $response.ContentLength64 = $buf.Length
            $response.OutputStream.Write($buf, 0, $buf.Length)
            $response.OutputStream.Close()
        }
    }
}
finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
}
