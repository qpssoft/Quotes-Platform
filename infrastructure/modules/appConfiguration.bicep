@description('App Configuration name')
param name string

@description('Azure region')
param location string

@description('Environment name')
param environment string

resource appConfiguration 'Microsoft.AppConfiguration/configurationStores@2023-03-01' = {
  name: name
  location: location
  sku: {
    name: 'free'
  }
  properties: {
    enablePurgeProtection: false
  }
  tags: {
    Environment: environment
    Project: 'QuotesBackend'
  }
}

output appConfigurationName string = appConfiguration.name
output appConfigurationId string = appConfiguration.id
output appConfigurationEndpoint string = appConfiguration.properties.endpoint
