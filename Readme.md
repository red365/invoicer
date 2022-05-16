## About Invoicer

This is the very first app I started to build, a long time ago (circa 2018), as a way of automating the laborious task of converting timesheets to invoices when I was freelancing. I used to use a website to input my data and create an invoice and then decided it was a good project to bring "in house".

The app allows the user to create clients and then create monthly invoice entries associated with clients. Invoice lists can then be viewed by year or by paginated list. Additionally, .csv files can be placed in _app-root_/timesheets/ and then linked to invoice entries by providing the filename of the timesheet when entering the invoice. If the invoice has an associated timesheet then it will be "pulled in" to the final invoice providing the client with an itemised breakdown of time spent as part of the invoice. Invoices can be exported for dissemination to your clients by using the "view" button, this displays a properly formatted invoice that can be exported to pdf using your browser.

It's had some revisions to it (eg initially it used a mongoDB back end) however due to the era in which I first started it it was written in the class component/setState style and this has been maintained over the course of the revisions.

### Setup

Should be fairly self-explanatory:

**1.** install the db using the .sql file provided

**2.** npm install

**3.** create _app-root_/config/ and add development.env and production.env files

**4.** Add the following settings to the above files and complete as appropriate:

    HOST=
    PORT=
    DB_NAME=
    DB_USER=
    DB_PASSWORD=
    BUSINESS_NAME=
    PHONE=
    EMAIL=

**5.** Create _app-root_/timesheets/ if necessary and add timesheets in .csv format

**6.** npm start or npm startDev

**7.** Browse to '/' on the url:port that your server is listening on
