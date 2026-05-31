export interface TypeUser{

    name: string;
    email: string;
    password?: string;
    googleId?: string;
    profilePic?:string
 
}
export type LogInType = Pick <TypeUser , "email"| "password">
