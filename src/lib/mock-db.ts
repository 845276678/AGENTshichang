import { User, UserRole, UserStatus, RefreshToken, PasswordResetToken, EmailVerificationToken } from '@/types/auth';

/**
 * Mock database implementation for demonstration purposes
 * In a real application, replace this with actual database operations
 */

// In-memory storage (replace with actual database)
const users = new Map<string, User>();
const refreshTokens = new Map<string, RefreshToken>();
const passwordResetTokens = new Map<string, PasswordResetToken>();
const emailVerificationTokens = new Map<string, EmailVerificationToken>();

// Initialize with some test data
initializeTestData();

function initializeTestData() {
  const testUsers: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      password: '$2a$10$dummy.hash.for.testing.purposes',
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      emailNotifications: true,
      marketingEmails: false
    }
  ];

  testUsers.forEach(user => {
    users.set(user.id, user);
  });
}

/**
 * User operations
 */
export const userDb = {
  async findById(id: string): Promise<User | null> {
    return users.get(id) || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async findByUsername(username: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.username === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = generateId();
    const now = new Date();
    
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };

    users.set(id, user);
    return user;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) {return null;}

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    users.set(id, updatedUser);
    return updatedUser;
  },

  async delete(id: string): Promise<boolean> {
    return users.delete(id);
  },

  async exists(email: string, username?: string): Promise<{ emailExists: boolean; usernameExists: boolean }> {
    let emailExists = false;
    let usernameExists = false;

    for (const user of users.values()) {
      if (user.email === email.toLowerCase()) {
        emailExists = true;
      }
      if (username && user.username === username.toLowerCase()) {
        usernameExists = true;
      }
      
      if (emailExists && (!username || usernameExists)) {
        break;
      }
    }

    return { emailExists, usernameExists };
  },

  async updateLastLogin(id: string): Promise<void> {
    const user = users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      users.set(id, user);
    }
  }
};

/**
 * Refresh token operations
 */
export const refreshTokenDb = {
  async create(tokenData: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const id = generateId();
    
    const refreshToken: RefreshToken = {
      ...tokenData,
      id,
      createdAt: new Date()
    };

    refreshTokens.set(refreshToken.token, refreshToken);
    return refreshToken;
  },

  async findByToken(token: string): Promise<RefreshToken | null> {
    return refreshTokens.get(token) || null;
  },

  async revoke(token: string): Promise<boolean> {
    const refreshToken = refreshTokens.get(token);
    if (refreshToken) {
      refreshToken.isRevoked = true;
      refreshTokens.set(token, refreshToken);
      return true;
    }
    return false;
  },

  async revokeAllForUser(userId: string): Promise<number> {
    let revokedCount = 0;
    for (const [token, tokenData] of refreshTokens.entries()) {
      if (tokenData.userId === userId && !tokenData.isRevoked) {
        tokenData.isRevoked = true;
        refreshTokens.set(token, tokenData);
        revokedCount++;
      }
    }
    return revokedCount;
  },

  async cleanup(): Promise<number> {
    let deletedCount = 0;
    const now = new Date();
    
    for (const [token, tokenData] of refreshTokens.entries()) {
      if (tokenData.expiresAt < now || tokenData.isRevoked) {
        refreshTokens.delete(token);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
};

/**
 * Password reset token operations
 */
export const passwordResetTokenDb = {
  async create(tokenData: Omit<PasswordResetToken, 'id' | 'createdAt'>): Promise<PasswordResetToken> {
    const id = generateId();
    
    const resetToken: PasswordResetToken = {
      ...tokenData,
      id,
      createdAt: new Date()
    };

    passwordResetTokens.set(resetToken.token, resetToken);
    return resetToken;
  },

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return passwordResetTokens.get(token) || null;
  },

  async markAsUsed(token: string): Promise<boolean> {
    const resetToken = passwordResetTokens.get(token);
    if (resetToken) {
      resetToken.isUsed = true;
      passwordResetTokens.set(token, resetToken);
      return true;
    }
    return false;
  },

  async deleteAllForUser(userId: string): Promise<number> {
    let deletedCount = 0;
    for (const [token, tokenData] of passwordResetTokens.entries()) {
      if (tokenData.userId === userId) {
        passwordResetTokens.delete(token);
        deletedCount++;
      }
    }
    return deletedCount;
  },

  async cleanup(): Promise<number> {
    let deletedCount = 0;
    const now = new Date();
    
    for (const [token, tokenData] of passwordResetTokens.entries()) {
      if (tokenData.expiresAt < now || tokenData.isUsed) {
        passwordResetTokens.delete(token);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
};

/**
 * Email verification token operations
 */
export const emailVerificationTokenDb = {
  async create(tokenData: Omit<EmailVerificationToken, 'id' | 'createdAt'>): Promise<EmailVerificationToken> {
    const id = generateId();
    
    const verificationToken: EmailVerificationToken = {
      ...tokenData,
      id,
      createdAt: new Date()
    };

    emailVerificationTokens.set(verificationToken.token, verificationToken);
    return verificationToken;
  },

  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    return emailVerificationTokens.get(token) || null;
  },

  async markAsUsed(token: string): Promise<boolean> {
    const verificationToken = emailVerificationTokens.get(token);
    if (verificationToken) {
      verificationToken.isUsed = true;
      emailVerificationTokens.set(token, verificationToken);
      return true;
    }
    return false;
  },

  async deleteAllForUser(userId: string): Promise<number> {
    let deletedCount = 0;
    for (const [token, tokenData] of emailVerificationTokens.entries()) {
      if (tokenData.userId === userId) {
        emailVerificationTokens.delete(token);
        deletedCount++;
      }
    }
    return deletedCount;
  },

  async cleanup(): Promise<number> {
    let deletedCount = 0;
    const now = new Date();
    
    for (const [token, tokenData] of emailVerificationTokens.entries()) {
      if (tokenData.expiresAt < now || tokenData.isUsed) {
        emailVerificationTokens.delete(token);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
};

/**
 * Utility functions
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Database cleanup operations
 */
export const dbCleanup = {
  async cleanupExpiredTokens(): Promise<{
    refreshTokens: number;
    passwordResetTokens: number;
    emailVerificationTokens: number;
  }> {
    const [refreshCount, resetCount, verificationCount] = await Promise.all([
      refreshTokenDb.cleanup(),
      passwordResetTokenDb.cleanup(),
      emailVerificationTokenDb.cleanup()
    ]);

    return {
      refreshTokens: refreshCount,
      passwordResetTokens: resetCount,
      emailVerificationTokens: verificationCount
    };
  }
};

/**
 * Get database statistics (for monitoring)
 */
export const dbStats = {
  getUserCount(): number {
    return users.size;
  },

  getActiveTokenCounts(): {
    refreshTokens: number;
    passwordResetTokens: number;
    emailVerificationTokens: number;
  } {
    const now = new Date();
    
    let activeRefreshTokens = 0;
    let activeResetTokens = 0;
    let activeVerificationTokens = 0;

    for (const token of refreshTokens.values()) {
      if (!token.isRevoked && token.expiresAt > now) {
        activeRefreshTokens++;
      }
    }

    for (const token of passwordResetTokens.values()) {
      if (!token.isUsed && token.expiresAt > now) {
        activeResetTokens++;
      }
    }

    for (const token of emailVerificationTokens.values()) {
      if (!token.isUsed && token.expiresAt > now) {
        activeVerificationTokens++;
      }
    }

    return {
      refreshTokens: activeRefreshTokens,
      passwordResetTokens: activeResetTokens,
      emailVerificationTokens: activeVerificationTokens
    };
  }
};