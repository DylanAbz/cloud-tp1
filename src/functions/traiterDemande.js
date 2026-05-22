const { app, output } = require('@azure/functions');

const tableOutput = output.table({
    tableName: 'DemandesTraitees',
    connection: 'AzureWebJobsStorage'
});

app.storageQueue('traiterDemande', {
    queueName: 'demandes-queue', 
    connection: 'AzureWebJobsStorage',
    extraOutputs: [tableOutput],
    handler: async (queueItem, context) => {
        context.log(`Message reçu depuis la file d'attente : ${queueItem}`);

        const tableEntity = {
            partitionKey: "MesDemandes",
            rowKey: Date.now().toString(), 
            Message: typeof queueItem === 'string' ? queueItem : JSON.stringify(queueItem),
            Statut: "Traité"
        };

        context.extraOutputs.set(tableOutput, tableEntity);
        
        context.log("Ligne ajoutée au Table Storage !");
    }
});