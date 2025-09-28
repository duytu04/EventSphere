// Azure Bicep template for EventSphere Monorepo deployment
// Frontend: Azure Static Web Apps (from /frontend)
// Backend: Azure App Service (from /backend)
// Repository: Monorepo structure

@description('Location for all resources (must be supported by Azure Static Web Apps)')
@allowed([
  'West US 2',
  'Central US', 
  'East US 2',
  'West Europe',
  'East Asia'
])
param location string = 'East US 2'

@description('Environment name (dev, staging, prod)')
param environmentName string = 'dev'

@description('Application name prefix')
param appNamePrefix string = 'eventsphere'

@description('Repository URL for monorepo')
param repositoryUrl string = ''

@description('Branch name for deployment')
param branchName string = 'main'

@description('MySQL administrator login')
param mysqlAdminLogin string = 'eventsphereadmin'

@description('MySQL administrator password')
@secure()
param mysqlAdminPassword string

@description('JWT Secret for authentication')
@secure()
param jwtSecret string

@description('Mail configuration')
param mailHost string = 'smtp.gmail.com'
param mailPort int = 587
param mailUsername string = ''
param mailPassword string = ''

// Variables
var appName = '${appNamePrefix}-${environmentName}'
var backendAppName = '${appName}-backend'
var frontendAppName = '${appName}-frontend'
var mysqlServerName = '${appName}-mysql'
var resourceGroupName = resourceGroup().name

// MySQL Server
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-01-preview' = {
  name: mysqlServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: mysqlAdminLogin
    administratorLoginPassword: mysqlAdminPassword
    version: '8.0.21'
    storage: {
      storageSizeGB: 20
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// MySQL Database
resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: mysqlServer
  name: 'eventsphere'
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Backend App Service
resource backendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: backendAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|mcr.microsoft.com/azure-app-service/java:11-java11'
      appSettings: [
        {
          name: 'SPRING_PROFILES_ACTIVE'
          value: 'production'
        }
        {
          name: 'DB_HOST'
          value: mysqlServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'DB_PORT'
          value: '3306'
        }
        {
          name: 'DB_USERNAME'
          value: mysqlAdminLogin
        }
        {
          name: 'DB_PASSWORD'
          value: mysqlAdminPassword
        }
        {
          name: 'DB_NAME'
          value: 'eventsphere'
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'JWT_EXPIRATION'
          value: '86400000'
        }
        {
          name: 'CORS_ALLOWED_ORIGINS'
          value: 'https://${frontendAppName}.azurestaticapps.net'
        }
        {
          name: 'MAIL_HOST'
          value: mailHost
        }
        {
          name: 'MAIL_PORT'
          value: string(mailPort)
        }
        {
          name: 'MAIL_USERNAME'
          value: mailUsername
        }
        {
          name: 'MAIL_PASSWORD'
          value: mailPassword
        }
        {
          name: 'MAIL_FROM'
          value: 'noreply@eventsphere.com'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
      ]
      alwaysOn: false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

// Static Web App for Monorepo
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: frontendAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branchName
    buildProperties: {
      appLocation: '/frontend'
      apiLocation: ''
      outputLocation: 'dist'
      appBuildCommand: 'cd frontend && npm ci && npm run build'
      apiBuildCommand: ''
    }
  }
}

// Outputs
output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendUrl string = 'https://${staticWebApp.properties.defaultHostName}'
output mysqlServerName string = mysqlServer.name
output resourceGroupName string = resourceGroupName
