import { useForm } from 'react-hook-form';
import { Button, Stack, TextField } from '@mui/material';
export function SearchForm({
  onSearch,
  disabled = false,
}: {
  onSearch: (text: string) => void;
  disabled?: boolean;
}) {
  const { register, handleSubmit } = useForm<{ search: string }>({
    defaultValues: { search: '' },
  });
  return (
    <Stack
      component="form"
      direction="row"
      spacing={1}
      sx={{ mb: 2 }}
      onSubmit={handleSubmit(({ search }) => onSearch(search))}
    >
      <TextField
        label="Pesquise o credor"
        placeholder="Pesquise o credor"
        fullWidth
        size="small"
        disabled={disabled}
        {...register('search')}
      />
      <Button type="submit" disabled={disabled}>
        Pesquisar
      </Button>
    </Stack>
  );
}
