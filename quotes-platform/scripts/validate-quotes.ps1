# Quote Dataset Validation Script
param(
    [string]$QuotesFile = "public\data\quotes.json"
)

Write-Host "Buddhist Quotes Dataset Validator" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $QuotesFile)) {
    Write-Host "Error: File not found: $QuotesFile" -ForegroundColor Red
    exit 1
}

Write-Host "Loading quotes..." -ForegroundColor Yellow
try {
    $quotes = Get-Content $QuotesFile -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "OK JSON is valid" -ForegroundColor Green
} catch {
    Write-Host "ERROR JSON is invalid: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nDataset Statistics:" -ForegroundColor Cyan
Write-Host "Total quotes: $($quotes.Count)" -ForegroundColor White

$categories = $quotes | Group-Object category
Write-Host "`nBy Category:" -ForegroundColor Cyan
foreach ($cat in $categories) {
    Write-Host "  $($cat.Name): $($cat.Count) items" -ForegroundColor White
}

$languages = $quotes | Group-Object language
Write-Host "`nBy Language:" -ForegroundColor Cyan
foreach ($lang in $languages) {
    $langName = if ($lang.Name -eq "vi") { "Vietnamese" } else { "English" }
    Write-Host "  $langName ($($lang.Name)): $($lang.Count) items" -ForegroundColor White
}

$authors = $quotes | Group-Object author | Sort-Object Count -Descending
Write-Host "`nTop Authors:" -ForegroundColor Cyan
$authors | Select-Object -First 5 | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) quotes" -ForegroundColor White
}

Write-Host "`nValidation Checks:" -ForegroundColor Cyan
$duplicateIds = $quotes | Group-Object id | Where-Object { $_.Count -gt 1 }
if ($duplicateIds) {
    Write-Host "ERROR Duplicate IDs found:" -ForegroundColor Red
    foreach ($dup in $duplicateIds) {
        Write-Host "  - $($dup.Name) appears $($dup.Count) times" -ForegroundColor Red
    }
} else {
    Write-Host "OK All IDs are unique" -ForegroundColor Green
}

$missingFields = $quotes | Where-Object {
    -not $_.id -or -not $_.content -or -not $_.author -or -not $_.category -or -not $_.type
}
if ($missingFields.Count -gt 0) {
    Write-Host "ERROR Missing required fields in $($missingFields.Count) quotes" -ForegroundColor Red
} else {
    Write-Host "OK All required fields present" -ForegroundColor Green
}

$tooLong = $quotes | Where-Object { $_.content.Length -gt 1000 }
if ($tooLong.Count -gt 0) {
    Write-Host "ERROR Content exceeds 1000 chars in $($tooLong.Count) quotes" -ForegroundColor Red
    foreach ($quote in $tooLong) {
        Write-Host "  - $($quote.id): $($quote.content.Length) chars" -ForegroundColor Red
    }
} else {
    Write-Host "OK All content within 1000 char limit" -ForegroundColor Green
}

$authorTooLong = $quotes | Where-Object { $_.author.Length -gt 100 }
if ($authorTooLong.Count -gt 0) {
    Write-Host "ERROR Author exceeds 100 chars in $($authorTooLong.Count) quotes" -ForegroundColor Red
} else {
    Write-Host "OK All author names within 100 char limit" -ForegroundColor Green
}

$viQuotes = $quotes | Where-Object { $_.language -eq "vi" }
Write-Host "OK Vietnamese quotes: $($viQuotes.Count)" -ForegroundColor Green

$withTags = ($quotes | Where-Object { $_.tags -and $_.tags.Count -gt 0 }).Count
$tagCoverage = [math]::Round(($withTags / $quotes.Count) * 100, 1)
if ($tagCoverage -eq 100) {
    Write-Host "OK All quotes have tags (100% coverage)" -ForegroundColor Green
} else {
    Write-Host "WARNING Tag coverage: $tagCoverage% ($withTags / $($quotes.Count))" -ForegroundColor Yellow
}

$fileInfo = Get-Item $QuotesFile
$fileSizeKB = [math]::Round($fileInfo.Length / 1024, 2)
Write-Host "`nFile Information:" -ForegroundColor Cyan
Write-Host "  Size: $fileSizeKB KB" -ForegroundColor White
Write-Host "  Bytes per quote: $([math]::Round($fileInfo.Length / $quotes.Count, 0))" -ForegroundColor White
Write-Host "  Last modified: $($fileInfo.LastWriteTime)" -ForegroundColor White

$targetSizeKB = 500
$estimatedCapacity = [math]::Floor(($targetSizeKB * 1024) / ($fileInfo.Length / $quotes.Count))
Write-Host "`nCapacity Estimate:" -ForegroundColor Cyan
Write-Host "  Current: $($quotes.Count) quotes" -ForegroundColor White
Write-Host "  Estimated max (at 500KB): ~$estimatedCapacity quotes" -ForegroundColor White

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "Validation Complete!" -ForegroundColor Green
Write-Host ""
