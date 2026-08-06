import { ExternalLink, Shield } from "lucide-react";

function AboutCard({ about }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">About</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Application information and legal
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">HoneyNetX</p>
            <p className="text-xs text-muted-foreground">{about.team}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Version</p>
            <p className="font-medium text-foreground">{about.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Build</p>
            <p className="font-medium text-foreground">{about.build}</p>
          </div>
          <div>
            <p className="text-muted-foreground">License</p>
            <p className="font-medium text-foreground">{about.license}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Website</p>
            <a
              href={about.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80"
            >
              {about.website.replace("https://", "")}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutCard;
