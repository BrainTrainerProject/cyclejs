export interface ProfileEntity{

    _id: string;
    email: string;
    photourl: string;
    visibility: boolean;
    cardsPerSession: number;
    interval: number;
    sets: string[];
    follower: string[];
    setsCount: number;
    notecardCount: number;
    followerCount: number;

}