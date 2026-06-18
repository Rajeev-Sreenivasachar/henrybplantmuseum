$files = Get-ChildItem -Path "c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum" -Filter "*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $filename = $file.Name

    $indexActive = if ($filename -eq "index.html") { ' class="active"' } else { '' }
    $aboutActive = if ($filename -eq "about.html") { ' class="active"' } else { '' }
    $eventsActive = if ($filename -eq "events.html") { ' class="active"' } else { '' }
    $exhibitsActive = if ($filename -eq "exhibits.html") { ' class="active"' } else { '' }
    $artifactsActive = if ($filename -eq "artifacts.html") { ' class="active"' } else { '' }
    $getInvolvedActive = if ($filename -eq "get_involved.html") { ' class="active"' } else { '' }
    $visitorActive = if ($filename -eq "visitor.html") { ' class="active"' } else { '' }
    $profileActive = if ($filename -eq "profile.html") { ' active' } else { '' }

    $navContent = @"
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="/index.html" class="logo">Henry B. Plant Museum</a>
      <i class="fa-solid fa-bars menu-toggle" id="menuToggle"></i>
      <div class="nav-links" id="navLinks">
        <a href="/index.html"${indexActive}>Home</a>
        <a href="/about.html"${aboutActive}>About</a>
        <a href="/events.html"${eventsActive}>Events</a>
        <a href="/exhibits.html"${exhibitsActive}>Exhibits</a>
        <a href="/artifacts.html"${artifactsActive}>Artifacts</a>
        <a href="/get_involved.html"${getInvolvedActive}>Get Involved</a>
        <a href="/visitor.html"${visitorActive}>Plan Your Visit</a>
        <a href="/profile.html" class="nav-cta${profileActive}">Sign In</a>
      </div>
      <a href="/profile.html" class="nav-cta${profileActive}">Sign In</a>
    </div>
  </nav>
"@

    $content = $content -replace '(?s)<nav class="navbar" id="navbar">.*?</nav>', $navContent
    Set-Content -Path $file.FullName -Value $content
    Write-Output "Updated navbar in $filename"
}
