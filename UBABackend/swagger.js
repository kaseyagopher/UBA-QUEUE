const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UBA API',
      version: '1.0.0',
      description: "Documentation de l'API UBA",
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        Service: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            nomService: { type: 'string' },
            description: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nomService', 'created_at', 'updated_at']
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            nom: { type: 'string' },
            postnom: { type: 'string' },
            prenom: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nom', 'postnom', 'prenom', 'created_at', 'updated_at']
        },
        Utilisateur: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            nom: { type: 'string' },
            postnom: { type: 'string' },
            prenom: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nom', 'postnom', 'prenom', 'created_at', 'updated_at']
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            numero: { type: 'integer', format: 'int32' },
            statut: { type: 'string' },
            heureArrivee: { type: 'string', format: 'date-time' },
            heureServi: { type: 'string', format: 'date-time', nullable: true },
            idService: { type: 'integer', format: 'int32', nullable: true },
            idClient: { type: 'integer', format: 'int32', nullable: true },
            idUtilisateur: { type: 'integer', format: 'int32', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'numero', 'statut', 'heureArrivee', 'created_at', 'updated_at']
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
