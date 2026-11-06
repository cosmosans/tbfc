import { useId } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { playerTypes, type PlayerType } from "../../model";

export default function PlayerTypeSelect({ value, onChange }: { value: PlayerType | ""; onChange: (value: PlayerType | "") => void }) {
  const labelId = useId();
  return <FormControl size="small" fullWidth>
    <InputLabel id={labelId}>Player Type</InputLabel>
    <Select labelId={labelId} label="Player Type" value={value} onChange={(event) => onChange(event.target.value as PlayerType | "")}>
      <MenuItem value="">Not set</MenuItem>
      {playerTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
    </Select>
  </FormControl>;
}
