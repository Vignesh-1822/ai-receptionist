import logging
import os

from dotenv import load_dotenv
from hubspot import Client
from hubspot.crm.associations.v4.models import AssociationSpec
from hubspot.crm.contacts.models import SimplePublicObjectInputForCreate as ContactInput
from hubspot.crm.deals.models import SimplePublicObjectInputForCreate as DealInput
from hubspot.crm.contacts.models import PublicObjectSearchRequest

from models.booking import Booking

load_dotenv()

logger = logging.getLogger(__name__)

_token = os.getenv("HUBSPOT_ACCESS_TOKEN", "")
client = Client.create(access_token=_token)


async def sync_booking_to_hubspot(booking: Booking) -> None:
    try:
        # Step 1 — find or create contact by phone
        search_request = PublicObjectSearchRequest(
            filter_groups=[
                {
                    "filters": [
                        {
                            "propertyName": "phone",
                            "operator": "EQ",
                            "value": booking.phone_number,
                        }
                    ]
                }
            ]
        )
        search_result = client.crm.contacts.search_api.do_search(
            public_object_search_request=search_request
        )

        if search_result.results:
            contact_id = search_result.results[0].id
        else:
            name_parts = booking.customer_name.strip().split(" ", 1)
            firstname = name_parts[0]
            lastname = name_parts[1] if len(name_parts) > 1 else ""

            new_contact = client.crm.contacts.basic_api.create(
                simple_public_object_input_for_create=ContactInput(
                    properties={
                        "firstname": firstname,
                        "lastname": lastname,
                        "phone": booking.phone_number,
                        "hs_lead_status": "NEW",
                    }
                )
            )
            contact_id = new_contact.id

        # Step 2 — create deal
        new_deal = client.crm.deals.basic_api.create(
            simple_public_object_input_for_create=DealInput(
                properties={
                    "dealname": f"{booking.service} — {booking.customer_name}",
                    "dealstage": "appointmentscheduled",
                    "pipeline": "default",
                    "closedate": booking.date,
                    "description": (
                        f"Service: {booking.service}\n"
                        f"Time: {booking.time}\n"
                        f"Booking ID: {booking.id}"
                    ),
                }
            )
        )
        deal_id = new_deal.id

        # Step 3 — associate deal → contact
        client.crm.associations.v4.basic_api.create(
            object_type="deals",
            object_id=deal_id,
            to_object_type="contacts",
            to_object_id=contact_id,
            association_spec=[
                AssociationSpec(
                    association_category="HUBSPOT_DEFINED",
                    association_type_id=3,
                )
            ],
        )

        logger.info(f"HubSpot sync complete: contact {contact_id}, deal {deal_id}")

    except Exception as exc:
        logger.error(f"HubSpot sync failed for booking {booking.id}: {exc}")
