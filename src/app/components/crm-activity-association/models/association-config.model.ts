import {ActivityAssociation} from './activity-association.model'
import { AssociationData } from './associtation-data.model';
export interface AssociationConfig{
    appId : number;
    elementId: number;
    activityAssociation: ActivityAssociation;
    assocData?:AssociationData;
} 