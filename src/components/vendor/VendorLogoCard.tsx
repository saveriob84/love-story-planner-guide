
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VendorProfileData } from "@/types/vendor";

interface VendorLogoCardProps {
  profileData: VendorProfileData;
  onInputChange: (field: keyof VendorProfileData, value: string) => void;
}

const VendorLogoCard = ({ profileData, onInputChange }: VendorLogoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Aziendale</CardTitle>
        <CardDescription>
          Carica il logo della tua attività
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="logo_url">URL Logo</Label>
            <Input
              id="logo_url"
              value={profileData.logo_url}
              onChange={(e) => onInputChange('logo_url', e.target.value)}
              placeholder="https://esempio.com/logo.png"
            />
          </div>
          {profileData.logo_url && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Anteprima logo:</p>
              <img 
                src={profileData.logo_url} 
                alt="Logo preview" 
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorLogoCard;
