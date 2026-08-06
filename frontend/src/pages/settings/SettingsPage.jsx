import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import mockSettings from "@/data/mockSettings";
import ProfileCard from "@/components/settings/ProfileCard";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ApiConfigurationCard from "@/components/settings/ApiConfigurationCard";
import SystemStatusCard from "@/components/settings/SystemStatusCard";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AboutCard from "@/components/settings/AboutCard";

function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <SettingsIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure application preferences and system settings
          </p>
        </div>
      </div>

      <ProfileCard profile={settings.profile} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AppearanceSettings
          settings={settings.appearance}
          onChange={(appearance) =>
            setSettings({ ...settings, appearance })
          }
        />
        <NotificationSettings
          settings={settings.notifications}
          onChange={(notifications) =>
            setSettings({ ...settings, notifications })
          }
        />
      </div>

      <SecuritySettings
        settings={settings.security}
        onChange={(security) => setSettings({ ...settings, security })}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ApiConfigurationCard api={settings.api} />
        <SystemStatusCard systemStatus={settings.systemStatus} />
      </div>

      <AboutCard about={settings.about} />
    </div>
  );
}

export default SettingsPage;
