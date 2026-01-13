Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Select download folder'
$dialog.ShowNewFolderButton = $true
$result = $dialog.ShowDialog()
if ($result -eq 'OK') {
    $dialog.SelectedPath
}
