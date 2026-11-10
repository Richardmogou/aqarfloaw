# Day 3 — Properties interface and public landing page

The workspace has a properties list and a property detail page, and the public site has a landing page with property search and featured listings. These pages currently display sample data.

## Properties list

The properties list is available at `http://localhost:3000/properties`. It has a search field, filters (property type, city or area, status, agent) and a table showing each property with its price, status, publication state and assigned agent. The **Add a property** button opens the creation form.

![Properties list in the workspace](../screenshots/day-3/aqarflow_dashboar_properties.png)

## Property details

A property page shows the photo gallery, the key information, the description with its features, and the inquiries received for this property. The **Edit** and **Unpublish** buttons manage the listing.

![Property details page](../screenshots/day-3/aqarflow_dashboard_property_details.png)

## Public landing page

The public landing page at `http://localhost:3000` lets visitors search by city, property type, purpose (buy or rent) and maximum budget, and shows featured properties with a **View details & contact** button. The **Agency portal** button leads to the login page.

![Public landing page](../screenshots/day-3/aqarflow_landingpage.png)

## Known limitations

The pages display sample data. Connecting them to the API is the next step.
