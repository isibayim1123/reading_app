import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  userType: 'student' | 'teacher';
  grade?: string;
}

const GRADES = [
  '小学1年',
  '小学2年',
  '小学3年',
  '小学4年',
  '小学5年',
  '小学6年',
  '中学1年',
  '中学2年',
  '中学3年',
  '高校1年',
  '高校2年',
  '高校3年',
];

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: {
      userType: 'student',
    },
  });

  const userType = watch('userType');
  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      await signUp(
        data.email,
        data.password,
        data.fullName,
        data.userType,
        data.grade
      );

      setSuccess(
        '登録が完了しました！確認メールをご確認ください。'
      );

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('このメールアドレスは既に登録されています。');
      } else {
        setError('登録に失敗しました。もう一度お試しください。');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            新規登録
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Reading Appで英語学習を始めましょう
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormControl fullWidth margin="normal" error={!!errors.userType}>
              <InputLabel>ユーザータイプ</InputLabel>
              <Controller
                name="userType"
                control={control}
                rules={{ required: 'ユーザータイプを選択してください' }}
                render={({ field }) => (
                  <Select {...field} label="ユーザータイプ">
                    <MenuItem value="student">生徒</MenuItem>
                    <MenuItem value="teacher">先生</MenuItem>
                  </Select>
                )}
              />
              {errors.userType && (
                <FormHelperText>{errors.userType.message}</FormHelperText>
              )}
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label="お名前"
              autoFocus
              {...register('fullName', {
                required: 'お名前を入力してください',
                minLength: {
                  value: 2,
                  message: 'お名前は2文字以上である必要があります',
                },
              })}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

            {userType === 'student' && (
              <FormControl fullWidth margin="normal" error={!!errors.grade}>
                <InputLabel>学年</InputLabel>
                <Controller
                  name="grade"
                  control={control}
                  rules={{
                    required:
                      userType === 'student'
                        ? '学年を選択してください'
                        : false,
                  }}
                  render={({ field }) => (
                    <Select {...field} label="学年">
                      {GRADES.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.grade && (
                  <FormHelperText>{errors.grade.message}</FormHelperText>
                )}
              </FormControl>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="メールアドレス"
              autoComplete="email"
              {...register('email', {
                required: 'メールアドレスを入力してください',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '有効なメールアドレスを入力してください',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="パスワード"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'パスワードを入力してください',
                minLength: {
                  value: 6,
                  message: 'パスワードは6文字以上である必要があります',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="パスワード（確認）"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'パスワード（確認）を入力してください',
                validate: (value) =>
                  value === password || 'パスワードが一致しません',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !!success}
            >
              {isLoading ? '登録中...' : '登録'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                既にアカウントをお持ちの方はこちら
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
