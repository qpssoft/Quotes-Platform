@description('Static Web App name')
param name string

@description('Azure region')
param location string

@description('Environment name')
param environment string

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: name
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: ''
    branch: ''
    buildProperties: {
      appLocation: 'quotes-admin'
      outputLocation: 'build'
    }
  }
  tags: {
    Environment: environment
    Project: 'QuotesBackend'
  }
}

output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
