import { ClockIcon, CreditCardIcon, UserIcon, UsersIcon } from "@heroicons/react/solid";
import { SchedulingType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import React from "react";
import { FormattedNumber, IntlProvider } from "react-intl";

import classNames from "@lib/classNames";

const eventTypeData = Prisma.validator<Prisma.EventTypeArgs>()({
  select: {
    id: true,
    length: true,
    price: true,
    currency: true,
    schedulingType: true,
    description: true,
  },
});

type EventType = Prisma.EventTypeGetPayload<typeof eventTypeData>;

export type EventTypeDescriptionProps = {
  eventType: EventType;
  className?: string;
};

export const EventTypeDescription = ({ eventType, className }: EventTypeDescriptionProps) => {
  return (
    <>
      <div className={classNames("text-neutral-500 dark:text-white", className)}>
        <ul className="flex mt-2">
          <li className="flex whitespace-nowrap">{eventType.length} mins</li>,&nbsp;
          {eventType.schedulingType ? (
            <li className="flex whitespace-nowrap">
              <UsersIcon className="inline mt-0.5 mr-1.5 h-4 w-4 text-neutral-400" aria-hidden="true" />
              {eventType.schedulingType === SchedulingType.ROUND_ROBIN && "Round Robin"}
              {eventType.schedulingType === SchedulingType.COLLECTIVE && "Collective"}
            </li>
          ) : (
            <li className="flex whitespace-nowrap"> One-on-One</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default EventTypeDescription;
