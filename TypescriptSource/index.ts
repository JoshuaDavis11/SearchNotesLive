// Import types
import type { LoanID, Note } from "./interfaces/types";
import type { Handlers } from "./interfaces/handlers";

const handlers: Handlers = {};
declare const ZOHO: any;
let allNotes: Note[] = [];
let access_token: string = "";
// Make onStart available in the global scope because of modules
(window as any).onStart = onStart;

function onStart() {
    handlers.init_task = function (data: LoanID) {
        if (handlers.GetNotes) {
            handlers.GetNotes(data);
        }
    };
    // Initialize listener for PageLoad event
    ZOHO.embeddedApp.on("PageLoad", handlers.init_task);
    // Initialize the embedded app and load all configurations
    ZOHO.embeddedApp.init().then((): void => { });
}

handlers.GetNotes = function (data: LoanID): void {
    fetchData(data)
        .then(() => PopulateNotes(allNotes));
};

async function PopulateNotes(notes: Note[]) {
    let noteCardContainer = document.getElementById("notesContainer");
    if (noteCardContainer) {
        noteCardContainer.innerHTML = ''; // Clear previous notes

        for (let i = 0; i < notes.length; i++) {
            if (notes[i].Note_Title === null) {
                notes[i].Note_Title = "";
            }
            if (notes[i].Note_Content === null) {
                notes[i].Note_Content = "";
            }

            let date: string = formatDate(notes[i].Created_Time);

            let htmlNoteCard: string = `
                <div class="card">
                    <div class="card-header" style="font-size: 15px;">
                        ${notes[i].Created_By.name}
                        <h6 id="cardDate" class="card-subtitle mb-2 text-body-secondary" style="font-size: 10px; font-style: italic; padding-top:5px">
                            ${date}
                        </h6>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title" id="cardTitle" style="font-size: 18px; font-weight: bold;">
                            ${notes[i].Note_Title}
                        </h5>
                        <p class="card-text" id="cardContent" style="font-size: 16px;">
                            ${notes[i].Note_Content}
                        </p>
                        <div id="noteAttachments">`;

            if (notes[i].$attachments != null) {
                for (let j = 0; j < notes[i].$attachments.length; j++) {
                    let attachmentLink = ""
                    if (notes[i].$attachments[j].File_Name.toLowerCase().endsWith('.pdf')) {
                        attachmentLink = `<a target="_blank" href="https://crm.zoho.com.au/crm/[Redacted]/specific/ViewAttachment?fileId=${notes[i].$attachments[j].$file_id}&module=CustomModule2&nId=${notes[i].$attachments[j].Parent_Id.id}&parentId=${notes[i].Parent_Id.id}&creatorId=${notes[i].$attachments[j].Created_By.id}&id=${notes[i].$attachments[j].id}&name=${notes[i].$attachments[j].File_Name}&downLoadMode=pdfViewPlugin&attach=undefined">${notes[i].$attachments[j].File_Name}</a>`;
                    }
                    else {
                        attachmentLink = `<button class="downloadFile" data-note-id="${notes[i].id}" data-attachment-name="${notes[i].$attachments[j].$file_id}" data-file-name="${notes[i].$attachments[j].File_Name}"data-attachment-id="${notes[i].$attachments[j].id}">${notes[i].$attachments[j].File_Name}</button>`;
                    }

                    htmlNoteCard += attachmentLink + ' ';
                }
            }
            htmlNoteCard += `</div>
                    </div>
                </div>`;
            noteCardContainer.innerHTML += htmlNoteCard;
        }

       
    }
}

document.getElementById("searchInput")?.addEventListener("input", (event: Event) => {
    const target = event.target as HTMLInputElement;
    const keyword = target.value;
    searchNotes(keyword);
}); 

function searchNotes(keyword: string) {
    const regex = new RegExp(keyword, 'i'); // 'i' makes it case-insensitive

    const filteredNotes = allNotes.filter(note => {
        const date = formatDate(note.Created_Time); // Get the formatted date
        return regex.test(note.Note_Title) ||
            regex.test(note.Note_Content) ||
            regex.test(date) ||
            regex.test(note.Created_By.name);
    });

    PopulateNotes(filteredNotes);
}

async function fetchData(data: LoanID) {
    let page = 1;
    let moreRecords = true;

    //loop fetch request as zoho is limited to fetching 200 records at a time
    while (moreRecords) {
        const req_data = {
            url: "https://www.zohoapis.com.au/crm/v2/functions/[Redacted]/actions/execute",
            params: {
                auth_type: 'apikey',
                zapikey: '[Redacted]',
                loanID: data.EntityId,
                PageNumber: page
            }
        };
        const response = await ZOHO.CRM.HTTP.post(req_data);
        const parsedResponse = JSON.parse(response);
        const detailsOutput = JSON.parse(parsedResponse.details.output);
        const dataArray: Note[] = JSON.parse(parsedResponse.details.output).data;
        dataArray.forEach(async (obj: Note) => {
            allNotes.push(obj);
        });

        // check if there are more records
        moreRecords = detailsOutput.info.more_records;
        page++;

    }
}


function formatDate(isoDateString: string): string {
    const months: string[] = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let dateTime: string[] = isoDateString.split("T");
    let dateOnly: string[] = dateTime[0].split("-");
    let year: string = dateOnly[0];
    let month: string = months[parseInt(dateOnly[1]) - 1];
    let day: string = dateOnly[2];

    return `${month} ${parseInt(day)}, ${year}`;
}
