export interface AssociationData {
    associatedContacts : {[id in number|string]:{
        id: number;
        first_name: string;
        last_name: string | null;
    }};
    associatedAccounts : {[id in number|string]:{
        id: number;
        customer_name: string;
    }}; 
    associatedOpportunities : {[id in number|string]:{
        id: number;
        opportunity_name: string;
    }};
    associatedLeads : {[id in number|string]:{
        id: number;
        lead_name: string;
    }};
}

