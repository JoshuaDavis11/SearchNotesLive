export type  Created_By = {
    email:string;
    id:string;
    name:string
}

export type LoanID = {
    ButtonPosition: string,
    Entity: string,
    EntityId: string
}


export type Note = {
    id:string,
    Note_Title: string;
    Note_Content: string;
    Created_By:Created_By;
    Created_Time:string;
    Parent_Id:Parent_Id;
    $attachments: Attachments[];
    FileArray: [];
}

 interface Attachments {
    $file_id: string;
    Parent_Id:Parent_Id;
    Created_By: Created_By
    id:string
    File_Name:string
}

interface Parent_Id{
    id:string
}
