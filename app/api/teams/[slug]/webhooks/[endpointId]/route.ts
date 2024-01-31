import env from "@/lib/env";
import { ApiError } from "@/lib/errors";
import { invalid } from "@/lib/messages";
import { recordMetric } from "@/lib/metrics";
import { sendAudit } from "@/lib/retraced";
import { deleteWebhook, findOrCreateApp, findWebhook, updateWebhook } from "@/lib/svix";
import { throwIfNoTeamAccess } from "models/team";
import { throwIfNotAllowed } from "models/user";
import { NextResponse } from "next/server";
import { EndpointIn } from "svix";

export async function GET(req: Request, { params }) {
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, "Không tìm thấy");
    }
    // Get a Webhook
    const teamMember = await throwIfNoTeamAccess(req, params.slug);
    throwIfNotAllowed(teamMember, "team_webhook", "read");

    const { endpointId } = params;

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(200, invalid("Yêu cầu"));
    }

    const webhook = await findWebhook(app.id, endpointId as string);

    recordMetric("webhook.fetched");
    return NextResponse.json({ data: webhook }, { status: 200 });
  } catch (error: any) {
    const message = error.message || "Đã xảy ra lỗi";
    const status = error.status || 500;
    return new NextResponse(
      JSON.stringify({
        status,
        message
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }) {
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, "Không tìm thấy");
    }
    // Update a Webhook
    const teamMember = await throwIfNoTeamAccess(req, params.slug);
    throwIfNotAllowed(teamMember, "team_webhook", "update");

    const { endpointId } = params;

    const { name, url, eventTypes } = (await req.json()) as {
      name: string;
      url: string;
      eventTypes: any;
    };
    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(200, invalid("Yêu cầu"));
    }

    if (!endpointId) {
      throw new ApiError(200, invalid("Yêu cầu"));
    }

    const data: EndpointIn = {
      description: name,
      url,
      version: 1
    };

    if (eventTypes.length > 0) {
      data["filterTypes"] = eventTypes;
    }

    const webhook = await updateWebhook(app.id, endpointId, data);

    sendAudit({
      action: "webhook.update",
      crud: "u",
      user: teamMember.user,
      team: teamMember.team
    });

    recordMetric("webhook.updated");

    return NextResponse.json({ data: webhook }, { status: 200 });
  } catch (error: any) {
    const message = error.message || "Đã xảy ra lỗi";
    const status = error.status || 500;
    return new NextResponse(
      JSON.stringify({
        status,
        message
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }) {
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, "Không tìm thấy");
    }
    // Delete a webhook
    const teamMember = await throwIfNoTeamAccess(req, params.slug);
    throwIfNotAllowed(teamMember, "team_webhook", "delete");
    const { endpointId } = params;

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(400, invalid("Yêu cầu"));
    }

    if (!endpointId) {
      throw new ApiError(400, invalid("Yêu cầu"));
    }

    if (app.uid != teamMember.team.id) {
      throw new ApiError(400, invalid("Yêu cầu"));
    }

    await deleteWebhook(app.id, endpointId);

    sendAudit({
      action: "webhook.delete",
      crud: "d",
      user: teamMember.user,
      team: teamMember.team
    });

    recordMetric("webhook.removed");

    return NextResponse.json({ data: {} }, { status: 200 });
  } catch (error: any) {
    const message = error.message || "Đã xảy ra lỗi";
    const status = error.status || 500;
    return new NextResponse(
      JSON.stringify({
        status,
        message
      }),
      { status: 500 }
    );
  }
}
