
// Common types for RPC functions
export type CreateUserRoleParams = {
  user_id: string;
  role_name: string;
};

export type CreateVendorProfileParams = {
  user_id: string;
  business_name: string;
  email_address: string;
  phone_number: string | null;
  website_url: string | null;
  vendor_description: string | null;
};

// Define the return type for these RPC functions
export type RpcFunctionReturn = {
  data: null;
  error: null | {
    message: string;
    details: string;
    hint: string;
    code: string;
  };
};
