param(
    [switch]$Full
)

function Wait-ForUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [int]$RetryCount = 30,
        [int]$DelaySeconds = 1
    )

    for ($attempt = 1; $attempt -le $RetryCount; $attempt++) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null
            return $true
        } catch {
            Start-Sleep -Seconds $DelaySeconds
        }
    }

    return $false
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
    Write-Error 'Python environment not found at .venv\Scripts\python.exe'
    exit 1
}

$services = @(
    @{ Name = 'api_gateway'; Path = 'api_gateway'; Command = "& '$python' manage.py runserver 8000" },
    @{ Name = 'book_service'; Path = 'book_service'; Command = "& '$python' manage.py runserver 8002" },
    @{ Name = 'customer_service'; Path = 'customer_service'; Command = "& '$python' manage.py runserver 8004" },
    @{ Name = 'cart_service'; Path = 'cart_service'; Command = "& '$python' manage.py runserver 8003" },
    @{ Name = 'order_service'; Path = 'order_service'; Command = "& '$python' manage.py runserver 8008" },
    @{ Name = 'pay_service'; Path = 'pay_service'; Command = "& '$python' manage.py runserver 8009" },
    @{ Name = 'ship_service'; Path = 'ship_service'; Command = "& '$python' manage.py runserver 8010" },
    @{ Name = 'comment_rate_service'; Path = 'comment_rate_service'; Command = "& '$python' manage.py runserver 8011" },
    @{ Name = 'recommender_ai_service'; Path = 'recommender_ai_service'; Command = "& '$python' manage.py runserver 8012" },
    @{ Name = 'frontend'; Path = 'frontend'; Command = 'npx vite --host 127.0.0.1 --force' }
)

if ($Full) {
    $services = @(
        @{ Name = 'staff_service'; Path = 'staff_service'; Command = "& '$python' manage.py runserver 8005" },
        @{ Name = 'manager_service'; Path = 'manager_service'; Command = "& '$python' manage.py runserver 8006" },
        @{ Name = 'catalog_service'; Path = 'catalog_service'; Command = "& '$python' manage.py runserver 8007" }
    ) + $services
}

foreach ($service in $services) {
    $workingDirectory = Join-Path $root $service.Path
    $command = "Set-Location '$workingDirectory'; $($service.Command)"
    Start-Process powershell -WorkingDirectory $workingDirectory -ArgumentList '-NoExit', '-Command', $command | Out-Null
}

Write-Host 'Waiting for frontend to become ready...'
$frontendReady = Wait-ForUrl -Url 'http://127.0.0.1:5173/'

Write-Host 'Started local services in separate PowerShell windows.'
if ($Full) {
    Write-Host 'Full stack: http://127.0.0.1:5173 and http://127.0.0.1:8000'
} else {
    Write-Host 'React stack: http://127.0.0.1:5173 via API gateway http://127.0.0.1:8000'
}

if (Wait-ForUrl -Url 'http://127.0.0.1:8000/' -RetryCount 15) {
    if ($Full) {
        Start-Process 'http://127.0.0.1:8000/' | Out-Null
    }
} else {
    Write-Warning 'API gateway did not respond on http://127.0.0.1:8000/ yet.'
}

if ($frontendReady) {
    Start-Process 'http://127.0.0.1:5173/' | Out-Null
} else {
    Write-Warning 'Frontend did not respond on http://127.0.0.1:5173/ yet. Check the frontend PowerShell window.'
}