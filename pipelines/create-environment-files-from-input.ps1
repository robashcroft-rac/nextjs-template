Param(
    [string] [Parameter(Mandatory = $true)] $environment,
    [string] [Parameter(Mandatory = $true)] $keyvaultName,
    [string] [Parameter(Mandatory = $false)] $secretsInput,
    [string] [Parameter(Mandatory = $true)] $workingDirectory
)

# Example and test values
# $environment = "dev"
# $keyvaultName = "RACWA-DCC-KEY-NPE-GITSAS"
# $secretsInput = "NEXT_PUBLIC_API_KEY=AddressSearchSubscriptionKey-AutoQuotes,NEXT_PUBLIC_API_RESOURCE_ID=AddressManagementADApplicationId-DEV";
# $workingDirectory = "..\"

#processing starts here



#Environment app settings
$applicationSettingsDirectory = "deployment-application-settings"
$environmentFile = ".env." + $environment.toLower()
$environmentSourceFileFullPath = Join-Path $workingDirectory $applicationSettingsDirectory 
$environmentSourceFileFullPath = Join-Path $environmentSourceFileFullPath $environmentFile
Write-Host "Environment file: $environmentSourceFileFullPath"   

#Output file settings
$outputFileName = ".env"
$outputFileFullPath = Join-Path $workingDirectory $outputFileName

#process expects there to be a base file of .env for the environment.  if it does not exist, then we will fail the build
if (!(Test-Path $environmentSourceFileFullPath)) {
    Write-host ""
    Write-Error "Could not find file $environmentSourceFileFullPath, please ensure that the file exists before running this script"
    Write-host ""
    exit 1
}

#copy and rename the base file to the output file
Copy-Item $environmentSourceFileFullPath $outputFileFullPath -Force

#if we don't have any secrets to fetch, then we can just copy the environment file and exit
if ($secretsInput.Length -eq 0) {
    Write-Host "No secrets to fetch, environment file created at $outputFileFullPath"
    exit 0
}

#split the secrets for fetching from keyvault
$secrets = $secretsInput -split ","

$secrets | ForEach-Object {
    #split each to get the app setting name and the secret name
    $secret = $_ -split "="
    $settingName = $secret[0].TOUpper()
    $secretName = $secret[1];
    Write-Host "Fetching secret value for $secretName from keyvault $keyvaultName"
    $value = az keyvault secret show --vault-name $keyvaultName --name $secretName --query value -o tsv
    if ($value.Length -gt 0) {
        Write-Host "Secret value for $secretName fetched successfully"
    }
    $secretSetting = "$settingName='$value'".Trim()
    $secretSetting | Out-File -FilePath $outputFileFullPath -Encoding Default -Append
}

Write-Host "Environment file created at $outputFileFullPath"
