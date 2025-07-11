import { NumberTicker } from "@/components/animation/number-ticker";
import { ActionBar } from "@/components/application/action-bar";
import { StatsCard } from "@/components/application/stats-card";
import { NotepadText } from "lucide-react";
import { assignBranchChange, assignRank, getAbnormalResults, getBasicInfo } from "./actions";
import { AbnormalResultsDiv, DeleteResultDiv, GetResultDiv, MailResultUpdateDiv } from "./client";

export default async function AdminResultPage() {
  const { counts, asOf } = await getBasicInfo();
  const abnormalsResults = await getAbnormalResults();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-3">
        <StatsCard
          title="Total Results"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <NumberTicker
            value={counts.results}
            className="text-3xl font-bold text-primary"
          />
          <p className="text-xs text-muted-foreground">As of {asOf}</p>
        </StatsCard>

        <StatsCard
          title="Assign Rank"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <ActionBar
            description="This will assign ranks to all students based on their CGPI."
            btnProps={{
              variant: "default_light",
              size: "sm",
              children: "Assign Rank",
            }}
            action={assignRank}
          />
        </StatsCard>

        <StatsCard
          title="Fix Branch Change"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <ActionBar
            description="This will fix the branch change for all students who have changed their branch."
            btnProps={{
              variant: "default_light",
              size: "sm",
              children: "Fix Branch Change",
            }}
            action={assignBranchChange}
          />
        </StatsCard>

        <StatsCard
          title="Get Result"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <GetResultDiv />
        </StatsCard>
        <StatsCard
          title="Delete Result"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <DeleteResultDiv />
        </StatsCard>
        <StatsCard
          title="Send Result Update Mail"
          Icon={<NotepadText className="size-4 text-muted-foreground" />}
        >
          <MailResultUpdateDiv />
        </StatsCard>
      </div>
        <AbnormalResultsDiv abnormalsResults={abnormalsResults} />
    </>
  );
}
