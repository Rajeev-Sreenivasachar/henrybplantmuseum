$files = Get-ChildItem -Path "c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum" -Filter "*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "opendyslexic") {
        $content = $content -replace "</head>", "  <link href=`"https://fonts.cdnfonts.com/css/opendyslexic`" rel=`"stylesheet`">`n</head>"
        Set-Content -Path $file.FullName -Value $content
        Write-Output "Added OpenDyslexic font to $($file.Name)"
    }
}
