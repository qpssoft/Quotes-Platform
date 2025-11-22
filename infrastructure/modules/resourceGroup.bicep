targetScope = 'subscription'

@description('Resource Group name')
param name string

@description('Azure region')
param location string

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: name
  location: location
  tags: {
    Project: 'QuotesBackend'
    ManagedBy: 'Bicep'
  }
}

output resourceGroupName string = resourceGroup.name
output resourceGroupId string = resourceGroup.id
