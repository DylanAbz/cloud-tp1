const { app, output } = require('@azure/functions');

const queueOutput = output.storageQueue({
    queueName: 'demandes-queue', 
    connection: 'AzureWebJobsStorage'
});

app.http('recevoirDemande', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [queueOutput],
    handler: async (request, context) => {
        context.log(`Requête HTTP reçue sur l'URL "${request.url}"`);

        const data = await request.text();

        if (!data) {
            return { 
                status: 400, 
                body: "Erreur : Veuillez envoyer des données dans le corps (body) de la requête." 
            };
        }

        context.extraOutputs.set(queueOutput, data);

        return { 
            status: 202, // 202 Accepted : signifie "J'ai bien reçu, ce sera traité plus tard"
            body: "Données reçues et envoyées dans la file d'attente avec succès." 
        };
    }
});