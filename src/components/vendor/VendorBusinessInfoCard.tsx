
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VendorProfileData } from "@/types/vendor";

interface VendorBusinessInfoCardProps {
  profileData: VendorProfileData;
  onInputChange: (field: keyof VendorProfileData, value: string) => void;
}

const VendorBusinessInfoCard = ({ profileData, onInputChange }: VendorBusinessInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Anagrafici</CardTitle>
        <CardDescription>
          Informazioni legali e identificative della tua attività
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business_name">Nome Attività *</Label>
            <Input
              id="business_name"
              value={profileData.business_name}
              onChange={(e) => onInputChange('business_name', e.target.value)}
              placeholder="Es. Wedding Dreams"
            />
          </div>
          <div>
            <Label htmlFor="ragione_sociale">Ragione Sociale</Label>
            <Input
              id="ragione_sociale"
              value={profileData.ragione_sociale}
              onChange={(e) => onInputChange('ragione_sociale', e.target.value)}
              placeholder="Es. Wedding Dreams S.r.l."
            />
          </div>
          <div>
            <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
            <Input
              id="codice_fiscale"
              value={profileData.codice_fiscale}
              onChange={(e) => onInputChange('codice_fiscale', e.target.value)}
              placeholder="Es. 12345678901"
            />
          </div>
          <div>
            <Label htmlFor="partita_iva">Partita IVA</Label>
            <Input
              id="partita_iva"
              value={profileData.partita_iva}
              onChange={(e) => onInputChange('partita_iva', e.target.value)}
              placeholder="Es. 01234567890"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorBusinessInfoCard;
