-- Add additional fields to clients table
ALTER TABLE clients
ADD COLUMN marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
ADD COLUMN employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'retired', 'unemployed')),
ADD COLUMN annual_income_range TEXT CHECK (annual_income_range IN ('under_25k', '25k_50k', '50k_100k', '100k_250k', 'over_250k')),
ADD COLUMN investment_experience TEXT CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN investment_objectives TEXT[],
ADD COLUMN preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'post')),
ADD COLUMN marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN last_review_date DATE,
ADD COLUMN next_review_date DATE,
ADD COLUMN total_assets DECIMAL(15,2),
ADD COLUMN notes TEXT;

-- Create investment_products table
CREATE TABLE investment_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    minimum_investment DECIMAL(15,2),
    management_fee DECIMAL(5,2),
    performance_fee DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create client_investments table
CREATE TABLE client_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES investment_products(id) ON DELETE CASCADE,
    amount_invested DECIMAL(15,2) NOT NULL,
    investment_date DATE NOT NULL,
    current_value DECIMAL(15,2),
    status TEXT CHECK (status IN ('active', 'closed', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE investment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_investments ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable read access for authenticated users" ON investment_products
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON client_investments
    FOR SELECT TO authenticated USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_investment_products_updated_at
    BEFORE UPDATE ON investment_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_investments_updated_at
    BEFORE UPDATE ON client_investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 