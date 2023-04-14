export type XMLResponse = {
    xml: { "@version": 1, "@encoding": "UTF-8" },
    ListingDataFeed: {
        "@xmlns": "http://www.vivareal.com/schemas/1.0/VRSync",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:schemaLocation": "http://www.vivareal.com/schemas/1.0/VRSync",
        Listings: {
            Listing: {
                ListingID: 1184,
                Title: "Apartamento em Rio Grande do Sul, Novo Hamburgo, Rua Heller. 4 Banheiros 2 Dorm.",
                TransactionType: "For Sale" | "Sale/Rent",
                Details: {
                    ListPrice: { "@currency": "BRL", "#text": 1600000 },
                    PropertyAdministrationFee: { "@currency": "BRL", "#text": 2179 },
                    YearlyTax: { "@currency": "BRL", "#text": 3600 },
                    PublicationType: "STANDARD",
                    Description: "Apartamento de luxo, localizado na região central de Novo Hamburgo, com uma infinidade de diferencia...",
                    PropertyType: "Residential / Apartment",
                    LotArea: { "@unit": "square metres", "#text": 222 },
                    Bathrooms: 4,
                    Bedrooms: 2,
                    Garage: 4,
                    Suites: 1,
                    Features: {
                        Feature: [
                            "Cooling",
                            "BBQ",
                            "Fireplace",
                            "Laundry",
                            "Balcony",
                            "Playground",
                            "Gourmet Area"
                        ]
                    }
                },
                Featured: false,
                Location: {
                    "@displayAddress": "Neighborhood",
                    Country: { "@abbreviation": "BR", "#text": "Brasil" },
                    State: { "@abbreviation": "RS", "#text": "Rio Grande do Sul" },
                    City: "Novo Hamburgo",
                    Neighborhood: "Centro",
                    Address: "Rua Heller",
                    StreetNumber: 61,
                    PostalCode: "93510-330",
                    Latitude: 0,
                    Longitude: 0
                },
                Media: {
                    Item: [
                        {
                            "@medium": "image",
                            "@caption": "img1",
                            "@primary": false,
                            "#text": "https://firebasestorage.googleapis.com/v0/b/smartimob-dev-test.appspot.com/o/empresas%2F4IYSm7WrQ8na..."
                        },
                    ]
                },
                ContactInfo: { Name: "Marques e Leão", Email: "negocios@marqueseleao.com.br" }[]
            }[]
        }
    }
}

export type CaracteristicaDB = {
    id: string,
    nome: string,
}
export type FotoImovelDB = {
    id: string,
    createdAt: Date
    imovelId: string
    caption: string
    url: string
    thumbnail: string
    isPrincipal: boolean
    isAtivo: boolean
}
export type ImovelDB = {
    id: "clgglzqnc0000w0tqw2jofx5o",
    createdAt: "2023-04-14 13:52:41.676",
    updatedAt: "2023-04-14 13:52:41.676",
    titulo: "Casa em Rio Grande do Sul, Campo Bom, Rua dos Andradas. 4 Banheiros 3 Dorm.",
    descricao: "Um dos poucos sobrados de alto padrão a venda no centro de Campo Bom, construído e pensado especialm...",
    cep: null,
    precoVenda: "1500000.000000000000000000000000000000",
    precoLocacao: null,
    precoDescontoVenda: null,
    precoDescontoLocacao: null,
    isVenda: 1,
    isLocacao: 0,
    isAtivo: 1,
    isPro: 0,
    isUltra: 0,
    tipo: "Residential / Home",
    numero: "513",
    rua: "Rua dos Andradas",
    bairro: "Centro",
    cidade: "Campo Bom",
    estado: "Rio Grande do Sul",
    empresaId: "1",
    areaTotal: "199.000000000000000000000000000000",
    banheiros: 4,
    quartos: 3,
    suites: 1,
    vagas: 2,
    latitude: "0.000000000000000000000000000000",
    longitude: "0.000000000000000000000000000000",
    listingId: "829"
}