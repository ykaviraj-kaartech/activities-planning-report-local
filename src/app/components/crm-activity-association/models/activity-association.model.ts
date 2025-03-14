export interface ActivityAssociation{
    accounts : number[];
    contacts : number[];
    opportunities : number[];
    leads : number[]; 
    default : {
        account : number | null;
        contact : number | null;
        lead : number | null;
        opportunity : number | null; 
    };
}