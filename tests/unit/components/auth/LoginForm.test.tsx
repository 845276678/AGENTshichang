import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm, LoginFormProps } from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  const defaultProps: LoginFormProps = {
    onSubmit: jest.fn(),
    onSocialLogin: jest.fn(),
    onForgotPassword: jest.fn(),
    isLoading: false,
    socialLoading: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginForm {...defaultProps} />)

    expect(screen.getByRole('heading', { name: /欢迎回来/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /记住我/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /忘记密码/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /登录/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请输入邮箱地址/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const passwordInput = screen.getByLabelText(/密码/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/密码至少需要6个字符/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
    render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /记住我/i })
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(rememberMeCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      })
    })

    expect(screen.getByText(/登录成功！正在跳转.../i)).toBeInTheDocument()
  })

  it('shows error message when submit fails', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
    render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText(/登录中.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('shows loading state when prop isLoading is true', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /登录中.../i })
    expect(submitButton).toBeDisabled()

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('calls onSocialLogin when social login button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSocialLogin = jest.fn()
    render(<LoginForm {...defaultProps} onSocialLogin={mockOnSocialLogin} />)

    // Note: This test depends on the SocialLoginButtons component having testable buttons
    // We'll assume there are buttons with specific test IDs or roles
    const googleButton = screen.getByRole('button', { name: /google/i })
    await user.click(googleButton)

    expect(mockOnSocialLogin).toHaveBeenCalledWith('google')
  })

  it('calls onForgotPassword when forgot password button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnForgotPassword = jest.fn()
    render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} />)

    const forgotPasswordButton = screen.getByRole('button', { name: /忘记密码/i })
    await user.click(forgotPasswordButton)

    expect(mockOnForgotPassword).toHaveBeenCalled()
  })

  it('clears error when trying social login after form error', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Form error'))
    const mockOnSocialLogin = jest.fn()
    render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} onSocialLogin={mockOnSocialLogin} />)

    // First, trigger form error
    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Form error/i)).toBeInTheDocument()
    })

    // Then try social login
    const googleButton = screen.getByRole('button', { name: /google/i })
    await user.click(googleButton)

    expect(screen.queryByText(/Form error/i)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<LoginForm {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows social loading state', () => {
    render(<LoginForm {...defaultProps} socialLoading="google" />)

    // This test assumes the SocialLoginButtons component shows loading for the specified provider
    const googleButton = screen.getByRole('button', { name: /google/i })
    expect(googleButton).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<LoginForm {...defaultProps} />)

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const passwordInput = screen.getByLabelText(/密码/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })
})