import { recordMetric } from "@/lib/metrics";
import { sendAudit } from "@/lib/retraced";
import { sendEvent } from "@/lib/svix";
import { deleteInvitation, getInvitation } from "@/models/invitation";
import { throwIfNoTeamAccess } from "@/models/team";
import { throwIfNotAllowed } from "@/models/user";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }) {
  try {
    // Delete invitation
    const teamMember = await throwIfNoTeamAccess(req, params.slug);
    throwIfNotAllowed(teamMember, "team_invitation", "delete");
    const id = params.invitationId;
    console.log(">>>>>>>>>>>>>>", id);
    if (id) {
      const invitation = await getInvitation({ id });
      if (invitation.invitedBy != teamMember.user.id || invitation.teamId != teamMember.teamId) {
        throw new ApiError(400, `Bạn không có quyền xóa lời mời này.`);
      }

      await deleteInvitation({ id });

      sendAudit({
        action: "member.invitation.delete",
        crud: "d",
        user: teamMember.user,
        team: teamMember.team
      });

      await sendEvent(teamMember.teamId, "invitation.removed", invitation);

      recordMetric("invitation.removed");

      return NextResponse.json({ data: {} }, { status: 200 });
    } else {
      throw new ApiError(400, "Missing id");
    }
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
