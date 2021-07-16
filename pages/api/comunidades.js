import {SiteClient} from 'datocms-client';

export default async function recebedorDeRequest(request, response){

    if(request.method === 'POST'){
        const TOKEN = '2218e358ab6683846a42cc673581ae'; //Token full access Dato
        const client = new SiteClient(TOKEN);

        const registro = await client.items.create({
            itemType: "970719", //Id do model community do Dato
            ...request.body,
            // title: "teste",
            // imageUrl: "https://picsum.photos/300/300",
            // linkUrl: "https://google.com",
            // creatorSlug: "Admin",
        });

        response.json({
            dados: 'Algum dado qualquer',
            registro,
        });
    }  
}