
  /**
   * Helper to parse JWT payload (no external lib needed for simple decoding).
   */
  private parseJwt(token: string): { sub: string; exp: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get current authenticated user ID from JWT token.
   * Returns null if not logged in or token invalid.
   */
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.parseJwt(token);
    return decoded && decoded.sub ? parseInt(decoded.sub, 10) : null;
  }
