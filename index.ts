import { parse } from "https://deno.land/x/xml/mod.ts"
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { connect } from 'npm:@planetscale/database'
import { cuid } from 'https://deno.land/x/cuid/index.js';

import { CaracteristicaDB, FotoImovelDB, ImovelDB, XMLResponse } from "./types.ts"
const env_vars = config();
const env = (key: string) => env_vars[key];

// const xml = await Deno.readTextFile("zap.xml")
// const json = parse(xml) as unknown as XMLResponse

const conn = connect({
    url: env('DATABASE_URL'),
})

const xml = await Deno.readTextFile("./zap.xml")
const json = parse(xml) as unknown as XMLResponse
const empresa = '1'

const possible_caracs = new Set()
for (const Listing of json.ListingDataFeed.Listings.Listing) {
    if (Listing.Details.Features?.Feature && Array.isArray(Listing.Details.Features.Feature)) {
        for (const Feature of Listing.Details.Features.Feature) {
            possible_caracs.add(Feature)
        }
    } else if (typeof Listing.Details.Features?.Feature === 'string') {
        possible_caracs.add(Listing.Details.Features.Feature)
    }
}
console.log(possible_caracs)
for await (const carac_name of possible_caracs) {
    const { rows } = await conn.execute(`select * from Caracteristica where nome = :nome limit 1`, { nome: carac_name })
    if (rows.length === 0) {
        await conn.execute(`INSERT INTO Caracteristica (id, nome) VALUES (?, ?)`, [cuid(), carac_name])
    }
}
// conn.execute(`delete from Imovel`)
let i = 1;
await Promise.all(json.ListingDataFeed.Listings.Listing.map(async Listing => {
    const { rows } = await conn.execute(`select * from Imovel where listingId = :listingId and empresaId = :empresaId limit 1`, { listingId: String(Listing.ListingID), empresaId: empresa })
    console.log(`${i}/${json.ListingDataFeed.Listings.Listing.length}`)
    i++;
    if (rows.length === 0) {
        const newImovelId = cuid()
        await conn.execute(`INSERT INTO Imovel (id, listingId, createdAt, updatedAt, titulo, descricao, cep, precoVenda, precoLocacao, precoDescontoVenda, precoDescontoLocacao, isVenda, isLocacao, isAtivo, 
                                                isPro, isUltra, tipo, numero, rua, bairro, cidade, estado, empresaId, areaTotal, banheiros, 
                                                quartos, suites, vagas, latitude, longitude
                                                ) VALUES 
                                                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                                                newImovelId , // id
                                                String(Listing.ListingID), // listingId
                                                new Date(), // createdAt
                                                new Date(), // updatedAt
                                                Listing.Title, // titulo
                                                Listing.Details.Description, // descricao
                                                null, // cep
                                                Listing?.Details?.ListPrice ? Listing?.Details?.ListPrice['#text'] : null, // precoVenda
                                                null, // precoLocacao
                                                null, // precoDescontoVenda
                                                null, // precoDescontoLocacao
                                                Listing.TransactionType === "For Sale" || Listing.TransactionType === "Sale/Rent", // isVenda
                                                Listing.TransactionType === "Sale/Rent", // isLocacao
                                                true, // isAtivo,
                                                false, // isPro
                                                false, // isUltra
                                                Listing.Details.PropertyType, // tipo
                                                Listing.Location.StreetNumber, // numero
                                                Listing.Location.Address, // rua
                                                Listing.Location.Neighborhood, // bairro
                                                Listing.Location.City, // cidade
                                                Listing.Location.State['#text'], // estado
                                                empresa, // empresaId
                                                Listing.Details.LotArea['#text'], // areaTotal
                                                Listing.Details.Bathrooms, // banheiros
                                                Listing.Details.Bedrooms, // quartos
                                                Listing.Details.Suites, // suites
                                                Listing.Details.Garage, // vagas
                                                Listing.Location.Latitude, // latitude
                                                Listing.Location.Longitude, // longitude
        ])
        // for every feature of the listing create a relation with the imovel
        if (Listing.Details.Features?.Feature && Array.isArray(Listing.Details.Features.Feature)) {
            await Promise.all(Listing.Details.Features.Feature.map(async (Feature) => {
                const FeatureDB = (await conn.execute(`select id from Caracteristica where nome = :nome limit 1`, { nome: Feature })).rows as CaracteristicaDB[]
                if (FeatureDB.length === 1) {
                    await conn.execute(`INSERT INTO CaracteristicasImoveis (imovelId, caracteristicaId) VALUES (?, ?)`, [newImovelId, FeatureDB[0].id])
                }
            }))
        }

        // for every photo of the listing create a relation with the imovel
        if (Listing?.Media?.Item && Array.isArray(Listing.Media.Item)) {
            await Promise.all(Listing.Media.Item.map(async (Item) => {
                await conn.execute(`INSERT INTO FotoImovel (id, imovelId, url, thumbnail, isPrincipal, isAtivo, caption) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [cuid(), newImovelId, Item['#text'], Item['#text'], Item['@primary'], true, Item['@caption']])
            }))
        }

    } else {
        const [ imovel ] = rows as ImovelDB[]
        
        await conn.execute(`UPDATE Imovel 
        SET updatedAt = :updatedAt,
        titulo = :titulo, descricao = :descricao, cep = :cep, precoVenda = :precoVenda, 
        precoLocacao = :precoLocacao, precoDescontoVenda = :precoDescontoVenda, precoDescontoLocacao = :precoDescontoLocacao, isVenda = :isVenda, 
        isLocacao = :isLocacao, isAtivo = :isAtivo, 
        isPro = :isPro, isUltra = :isUltra, tipo = :tipo, numero = :numero, 
        rua = :rua, bairro = :bairro, cidade = :cidade, estado = :estado, 
        areaTotal = :areaTotal, banheiros = :banheiros, 
        quartos = :quartos, suites = :suites, vagas = :vagas, latitude = :latitude, 
        longitude = :longitude
        where id = :id`, { id: imovel.id, updatedAt: new Date(), 
            titulo: Listing.Title, 
            descricao: Listing.Details.Description, 
            cep: null, 
            precoVenda: Listing?.Details?.ListPrice ? Listing?.Details?.ListPrice['#text'] : null,
            precoLocacao: null,
            precoDescontoVenda: null,
            precoDescontoLocacao: null,
            isVenda: Listing.TransactionType === "For Sale" || Listing.TransactionType === "Sale/Rent",
            isLocacao: Listing.TransactionType === "Sale/Rent",
            isAtivo: true,
            isPro: false,
            isUltra: false,
            tipo: Listing.Details.PropertyType,
            numero: Listing.Location.StreetNumber,
            rua: Listing.Location.Address,
            bairro: Listing.Location.Neighborhood,
            cidade: Listing.Location.City,
            estado: Listing.Location.State['#text'],
            areaTotal: Listing.Details.LotArea['#text'],
            banheiros: Listing.Details.Bathrooms,
            quartos: Listing.Details.Bedrooms,
            suites: Listing.Details.Suites,
            vagas: Listing.Details.Garage,
            latitude: Listing.Location.Latitude,
            longitude: Listing.Location.Longitude
            })
            
        // for every feature of the listing create a relation with the imovel
        if (Listing.Details.Features?.Feature && Array.isArray(Listing.Details.Features.Feature)) {
            await conn.execute(`DELETE FROM CaracteristicasImoveis WHERE imovelId = ?`, [imovel.id])
            await Promise.all(Listing.Details.Features.Feature.map(async (Feature) => {
                const FeatureDB = (await conn.execute(`select id from Caracteristica where nome = :nome limit 1`, { nome: Feature })).rows as CaracteristicaDB[]
                if (FeatureDB.length === 1) {
                    await conn.execute(`INSERT INTO CaracteristicasImoveis (imovelId, caracteristicaId) VALUES (?, ?)`, [imovel.id, FeatureDB[0].id])
                }
            }))
        }
        
        // get all photos of the imovel
        const fotos = (await conn.execute(`SELECT * FROM FotoImovel WHERE imovelId = ?`, [imovel.id])).rows as FotoImovelDB[]
        const fotosListing = Listing?.Media?.Item && Array.isArray(Listing.Media.Item) ? Listing.Media.Item : []

        await Promise.all(fotos.map(fotoOld => {
            const fotoListing = fotosListing.find(fotoListing => fotoListing['#text'] === fotoOld.url)
            if (fotoListing) {
                return conn.execute(`UPDATE FotoImovel SET isAtivo = ?, isPrincipal = ?, caption = ?, url = ?, thumbnail = ? WHERE id = ?`, [true, fotoListing['@primary'], fotoListing['@caption'], fotoOld.id, fotoListing['#text'], fotoListing['#text']])
            }
        }))
    }  
}))
