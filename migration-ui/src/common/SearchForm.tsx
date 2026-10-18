import { useForm } from 'react-hook-form';
import { Button, Stack, TextField } from '@mui/material';
export function SearchForm({
  onSearch,
  disabled = false,
  label = 'Pesquise o credor',
}: {
  onSearch: (text: string) => void;
  disabled?: boolean;
  label?: string;
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
        label={label}
        placeholder={label}
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
