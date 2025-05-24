
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorProfileData } from "@/types/vendor";

interface VendorContactInfoCardProps {
  profileData: VendorProfileData;
  onInputChange: (field: keyof VendorProfileData, value: string) => void;
}

const VendorContactInfoCard = ({ profileData, onInputChange }: VendorContactInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni di Contatto</CardTitle>
        <CardDescription>
          Dati inseriti durante la registrazione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="info@weddingdreams.it"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+39 123 456 7890"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website">Sito Web</Label>
            <Input
              id="website"
              value={profileData.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              placeholder="https://www.weddingdreams.it"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descrizione Attività</Label>
          <Textarea
            id="description"
            value={profileData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Descrivi la tua attività e i servizi offerti..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorContactInfoCard;
