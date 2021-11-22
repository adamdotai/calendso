import {
  Avatar,
  Box,
  Divider,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  IconButton,
  CopyIcon,
  BaseLink,
  MoreOptionsIcon,
  Dropdown,
  Switch,
  Tooltip,
  HStack,
  Button,
  AddIcon,
  Icon,
} from "@adamdotai/design-system";
import { UsersIcon } from "@heroicons/react/solid";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment } from "react";

import { getSession } from "@lib/auth";
import { extractLocaleInfo } from "@lib/core/i18n/i18n.utils";
import { ONBOARDING_INTRODUCED_AT } from "@lib/getting-started";
import { useLocale } from "@lib/hooks/useLocale";
import prisma from "@lib/prisma";
import { inferSSRProps } from "@lib/types/inferSSRProps";

import Shell from "@components/Shell";
import EventTypeDescription from "@components/eventtype/EventTypeDescription";
import { Alert } from "@components/ui/Alert";
import Badge from "@components/ui/Badge";
import UserCalendarIllustration from "@components/ui/svg/UserCalendarIllustration";

type PageProps = inferSSRProps<typeof getServerSideProps>;
type EventType = PageProps["eventTypes"][number];
type Profile = PageProps["profiles"][number];
type MembershipCount = EventType["metadata"]["membershipCount"];

const EventTypesPage = (props: PageProps) => {
  const router = useRouter();

  const { locale } = useLocale({
    localeProp: props.localeProp,
    namespaces: "event-types-page",
  });

  const CreateFirstEventTypeView = () => (
    <div className="md:py-20">
      <UserCalendarIllustration />
      <div className="block mx-auto text-center md:max-w-screen-sm">
        <h3 className="mt-2 text-xl font-bold text-neutral-900">Create your first event type</h3>
        <p className="mt-1 mb-2 text-md text-neutral-600">
          Event types enable you to share links that show available times on your calendar and allow people to
          make bookings with you.
        </p>
        <CreateNewEventDialog
          localeProp={locale}
          canAddEvents={props.canAddEvents}
          profiles={props.profiles}
        />
      </div>
    </div>
  );

  const EventTypeListHeading = ({
    profile,
    membershipCount,
  }: {
    profile?: Profile;
    membershipCount: MembershipCount;
  }) => (
    <div className="flex mb-4">
      <Link href="/settings/teams">
        <a>
          <Avatar
            displayName={profile?.name || ""}
            imageSrc={profile?.image || undefined}
            size={8}
            className="inline mt-1 mr-2"
          />
        </a>
      </Link>
      <div>
        <Link href="/settings/teams">
          <a className="font-bold">{profile?.name || ""}</a>
        </Link>
        {membershipCount && (
          <span className="relative ml-2 text-xs text-neutral-500 -top-px">
            <Link href="/settings/teams">
              <a>
                <Badge variant="gray">
                  <UsersIcon className="inline w-3 h-3 mr-1 -mt-px" />
                  {membershipCount}
                </Badge>
              </a>
            </Link>
          </span>
        )}
        {profile?.slug && (
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/${profile.slug}`}>
            <a className="block text-xs text-neutral-500">{`${process.env.NEXT_PUBLIC_APP_URL?.replace(
              "https://",
              ""
            )}/${profile.slug}`}</a>
          </Link>
        )}
      </div>
    </div>
  );

  const EventTypeList = ({
    profile,
    types,
  }: {
    profile: PageProps["profiles"][number];
    readOnly: boolean;
    types: EventType["eventTypes"];
  }) => {
    return (
      <Box mb={4}>
        <SimpleGrid as="ul" columns={[1, 2, 3]} gap={6} data-testid="event-types">
          {types.map((type) => (
            <Box
              as="li"
              bg="white"
              boxShadow="sm"
              p={4}
              pb={6}
              key={type.id}
              data-disabled={type.$disabled ? 1 : 0}>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">{type.title}</Text>
                    <EventTypeDescription eventType={type} />
                  </Box>
                  <Box>
                    <Dropdown>
                      <Dropdown.Button>
                        <IconButton aria-label="More options" icon={<MoreOptionsIcon />} />
                      </Dropdown.Button>
                      <Dropdown.List>
                        <Dropdown.Item>
                          <Link href={"/event-types/" + type.id}>Edit</Link>
                        </Dropdown.Item>
                        <Dropdown.Item>Duplicate</Dropdown.Item>
                        <Dropdown.Item>Delete</Dropdown.Item>
                        <Dropdown.Item>
                          <Switch /> Turn Off
                        </Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown>
                  </Box>
                </Flex>

                <Divider />

                <VStack spacing={5} align="stretch">
                  <Avatar />
                  <Flex justify="space-between">
                    <Link passHref href={`${process.env.NEXT_PUBLIC_APP_URL}/${profile.slug}/${type.slug}`}>
                      <BaseLink>View booking page</BaseLink>
                    </Link>
                    <Tooltip label="Copy link">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${process.env.NEXT_PUBLIC_APP_URL}/${profile.slug}/${type.slug}`
                          );
                        }}
                        aria-label="Copy link"
                        icon={<CopyIcon />}
                      />
                    </Tooltip>
                  </Flex>
                </VStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <div>
      <Head>
        <title>Event Types | Cal.com</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Shell>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <HStack>
              <Avatar />
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/${
                  router.query.eventPage || props.profiles[0].slug
                }`}
                passHref>
                <BaseLink>
                  {process.env.NEXT_PUBLIC_APP_URL}/{router.query.eventPage || props.profiles[0].slug}/
                </BaseLink>
              </Link>
            </HStack>
            {props.eventTypes.length !== 0 && (
              <CreateNewEventDialog canAddEvents={props.canAddEvents} profiles={props.profiles} />
            )}
          </HStack>
          {props.user.plan === "FREE" && !props.canAddEvents && (
            <Alert
              severity="warning"
              title={<>You need to upgrade your plan to have more than one active event type.</>}
              message={
                <>
                  To upgrade go to{" "}
                  <a href={"https://cal.com/upgrade"} className="underline">
                    {"https://cal.com/upgrade"}
                  </a>
                </>
              }
              className="my-4"
            />
          )}
          {props.eventTypes &&
            props.eventTypes.map((input) => (
              <Fragment key={input.profile?.slug}>
                {/* hide list heading when there is only one (current user) */}
                {(props.eventTypes.length !== 1 || input.teamId) && (
                  <EventTypeListHeading
                    profile={input.profile}
                    membershipCount={input.metadata?.membershipCount}
                  />
                )}
                <EventTypeList
                  types={input.eventTypes}
                  profile={input.profile}
                  readOnly={input.metadata?.readOnly}
                />
              </Fragment>
            ))}

          {props.eventTypes.length === 0 && <CreateFirstEventTypeView />}
        </VStack>
      </Shell>
    </div>
  );
};

const CreateNewEventDialog = ({
  profiles,
  canAddEvents,
  localeProp,
}: {
  profiles: Profile[];
  canAddEvents: boolean;
  localeProp: string;
}) => {
  const { t } = useLocale({ localeProp });

  return (
    !profiles.filter((profile) => profile.teamId).length && (
      <Dropdown>
        <Dropdown.Button>
          <Button
            variant="outline"
            data-testid="new-event-type"
            startIcon={<Icon as={AddIcon} />}
            disabled={!canAddEvents}>
            {t("new-event-type-btn")}
          </Button>
        </Dropdown.Button>
        <Dropdown.List>
          <Dropdown.Item>One-on-One booking</Dropdown.Item>
          <Dropdown.Item>Group booking</Dropdown.Item>
        </Dropdown.List>
      </Dropdown>
    )
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const locale = await extractLocaleInfo(context.req);

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  /**
   * This makes the select reusable and type safe.
   * @url https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/prisma-validator#using-the-prismavalidator
   * */
  const eventTypeSelect = Prisma.validator<Prisma.EventTypeSelect>()({
    id: true,
    title: true,
    description: true,
    length: true,
    schedulingType: true,
    slug: true,
    hidden: true,
    price: true,
    currency: true,
    users: {
      select: {
        id: true,
        avatar: true,
        name: true,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      startTime: true,
      endTime: true,
      bufferTime: true,
      avatar: true,
      completedOnboarding: true,
      createdDate: true,
      plan: true,
      teams: {
        where: {
          accepted: true,
        },
        select: {
          role: true,
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              members: {
                select: {
                  userId: true,
                },
              },
              eventTypes: {
                select: eventTypeSelect,
              },
            },
          },
        },
      },
      eventTypes: {
        where: {
          team: null,
        },
        select: eventTypeSelect,
      },
    },
  });

  if (!user) {
    // this shouldn't happen
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login",
      },
    };
  }

  if (!user.completedOnboarding && dayjs(user.createdDate).isAfter(ONBOARDING_INTRODUCED_AT)) {
    return {
      redirect: {
        permanent: false,
        destination: "/getting-started",
      },
    };
  }

  // backwards compatibility, TMP:
  const typesRaw = await prisma.eventType.findMany({
    where: {
      userId: session.user.id,
    },
    select: eventTypeSelect,
  });

  type EventTypeGroup = {
    teamId?: number | null;
    profile?: {
      slug: typeof user["username"];
      name: typeof user["name"];
      image: typeof user["avatar"];
    };
    metadata: {
      membershipCount: number;
      readOnly: boolean;
    };
    eventTypes: (typeof user.eventTypes[number] & { $disabled?: boolean })[];
  };

  let eventTypeGroups: EventTypeGroup[] = [];
  const eventTypesHashMap = user.eventTypes.concat(typesRaw).reduce((hashMap, newItem) => {
    const oldItem = hashMap[newItem.id] || {};
    hashMap[newItem.id] = { ...oldItem, ...newItem };
    return hashMap;
  }, {} as Record<number, EventTypeGroup["eventTypes"][number]>);
  const mergedEventTypes = Object.values(eventTypesHashMap).map((et, index) => ({
    ...et,
    $disabled: user.plan === "FREE" && index > 0,
  }));

  eventTypeGroups.push({
    teamId: null,
    profile: {
      slug: user.username,
      name: user.name,
      image: user.avatar,
    },
    eventTypes: mergedEventTypes,
    metadata: {
      membershipCount: 1,
      readOnly: false,
    },
  });

  eventTypeGroups = ([] as EventTypeGroup[]).concat(
    eventTypeGroups,
    user.teams.map((membership) => ({
      teamId: membership.team.id,
      profile: {
        name: membership.team.name,
        image: membership.team.logo || "",
        slug: "team/" + membership.team.slug,
      },
      metadata: {
        membershipCount: membership.team.members.length,
        readOnly: membership.role !== "OWNER",
      },
      eventTypes: membership.team.eventTypes,
    }))
  );

  const userObj = Object.assign({}, user, {
    createdDate: user.createdDate.toString(),
  });

  const canAddEvents = user.plan !== "FREE" || eventTypeGroups[0].eventTypes.length < 1;

  return {
    props: {
      session,
      localeProp: locale,
      canAddEvents,
      user: userObj,
      // don't display event teams without event types,
      eventTypes: eventTypeGroups.filter((groupBy) => !!groupBy.eventTypes?.length),
      // so we can show a dropdown when the user has teams
      profiles: eventTypeGroups.map((group) => ({
        teamId: group.teamId,
        ...group.profile,
        ...group.metadata,
      })),
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default EventTypesPage;
