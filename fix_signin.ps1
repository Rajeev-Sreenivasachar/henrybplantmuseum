$files = Get-ChildItem -Path "c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum" -Filter "*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Remove the <a href="/profile.html" class="nav-cta">Sign In</a> that comes right before </div>\s*<a href="/profile.html" class="nav-cta">Sign In</a>
    $content = $content -replace '(?s)<a href="/profile\.html" class="nav-cta">Sign In</a>\s*</div>\s*<a href="/profile\.html" class="nav-cta">Sign In</a>', '</div>`n      <a href="/profile.html" class="nav-cta">Sign In</a>'
    Set-Content -Path $file.FullName -Value $content
}
Write-Output "Fixed double Sign In in navbars."
