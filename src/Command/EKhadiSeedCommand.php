<?php

declare(strict_types=1);

namespace EKhadi\Command;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Generates realistic South African seed data for the e-Khadi demo.
 *
 * Usage:
 *   bin/console ekhadi:seed
 *   bin/console ekhadi:seed --fresh   (drops existing ekhadi seed data first)
 */
#[AsCommand(name: 'ekhadi:seed', description: 'Seed e-Khadi demo data: 9 provinces, 180 areas, 1000 customers, 80 groups')]
class EKhadiSeedCommand extends Command
{
    // ─── South African provinces and 20 townships/areas each ───────────────

    private const PROVINCES = [
        'Gauteng' => [
            'Alexandra', 'Soweto', 'Tembisa', 'Katlehong', 'Vosloorus',
            'Meadowlands', 'Diepsloot', 'Ivory Park', 'Thokoza', 'Germiston CBD',
            'Brakpan', 'Orange Farm', 'Evaton', 'Sebokeng', 'Lenasia',
            'Eldorado Park', 'Daveyton', 'Tsakane', 'Duduza', 'Wattville',
        ],
        'Western Cape' => [
            'Khayelitsha', 'Mitchells Plain', 'Gugulethu', 'Langa', 'Nyanga',
            'Manenberg', 'Hanover Park', 'Belhar', 'Delft', 'Bellville South',
            'Elsies River', 'Retreat', 'Grassy Park', 'Lavender Hill', 'Steenberg',
            'Mfuleni', 'Kuils River', 'Paarl East', 'Strand', 'Somerset West',
        ],
        'Eastern Cape' => [
            'Mdantsane', 'Motherwell', 'New Brighton', 'Kwazakhele', 'Zwide',
            'Despatch', 'KwaNobuhle', 'Uitenhage Central', 'Mthatha CBD', 'Idutywa',
            'Butterworth', 'Komani', 'Queenstown Central', 'Mzontsundu', 'Bhisho',
            'King Williams Town', 'Dimbaza', 'Alice', 'Fort Beaufort', 'Peddie',
        ],
        'KwaZulu-Natal' => [
            'Umlazi', 'KwaMashu', 'Ntuzuma', 'Inanda', 'Phoenix',
            'Chatsworth', 'Wentworth', 'Lamontville', 'Isipingo', 'Tongaat',
            'KwaDukuza', 'Empangeni', 'Richards Bay', 'Mthunzini', 'Eshowe',
            'Stanger', 'Maphumulo', 'Greytown', 'Pongola', 'Newcastle CBD',
        ],
        'Limpopo' => [
            'Seshego', 'Giyani', 'Tzaneen', 'Phalaborwa', 'Polokwane Central',
            'Mankweng', 'Turfloop', 'Modimolle', 'Bela-Bela', 'Mokopane',
            'Ellisras', 'Bochum', 'Senwabarwana', 'Louis Trichardt', 'Musina',
            'Thulamela', 'Malamulele', 'Lephalale', 'Makhado', 'Sekhukhune',
        ],
        'Mpumalanga' => [
            'Kanyamazane', 'Msogwaba', 'KwaMhlanga', 'Siyabuswa', 'Emalahleni CBD',
            'Witbank East', 'Ermelo', 'Secunda', 'Standerton', 'Bethal',
            'Carolina', 'Nelspruit Central', 'Matsulu', 'Kabokweni', 'Barberton',
            'Hazyview', 'White River', 'Mhluzi', 'Nkangala', 'Middelburg MP',
        ],
        'North West' => [
            'Mafikeng', 'Mmabatho', 'Garankuwa', 'Mabopane', 'Soshanguve North',
            'Temba', 'Brits', 'Rustenburg Central', 'Tlhabane', 'Phokeng',
            'Vryburg', 'Lichtenburg', 'Potchefstroom Central', 'Ikageng', 'Klerksdorp',
            'Jouberton', 'Hartbeespoort', 'Mogwase', 'Zeerust', 'Derby',
        ],
        'Free State' => [
            'Mangaung', 'Botshabelo', 'Thaba Nchu', 'Bloemfontein Central', 'Bainsvlei',
            'Heidedal', 'Phahameng', 'Rocklands', 'Welkom', 'Odendaalsrus',
            'Virginia', 'Allanridge', 'Sasolburg', 'Vaal Triangle', 'Kroonstad',
            'Maokeng', 'Phuthaditjhaba', 'Senekal', 'Bethlehem', 'Harrismith',
        ],
        'Northern Cape' => [
            'Galeshewe', 'Roodepan', 'Greenpoint KC', 'Kimberley Central', 'Platfontein',
            'De Aar', 'Upington Central', 'Keimoes', 'Kakamas', 'Springbok',
            'Aggeneys', 'Pofadder', 'Kuruman', 'Daniëlskuil', 'Douglas',
            'Prieska', 'Richmond NC', 'Hanover', 'Victoria West', 'Carnarvon',
        ],
    ];

    // ─── Realistic SA names ─────────────────────────────────────────────────

    private const MALE_NAMES = [
        'Sipho', 'Thabo', 'Lungelo', 'Sifiso', 'Nkosi', 'Mthokozisi', 'Bongani',
        'Luyanda', 'Sandile', 'Sivuyile', 'Tshepo', 'Tumelo', 'Kagiso', 'Mpho',
        'Tshifhiwa', 'Murendeni', 'Risuna', 'Petros', 'Johannes', 'Elias',
        'Moses', 'David', 'Samuel', 'Emmanuel', 'Patrick', 'Joseph', 'Lucky',
        'Innocent', 'Goodwill', 'Happiness', 'Wonderful', 'Brilliant', 'Given',
        'Pieter', 'Jan', 'Christo', 'Johan', 'Gerrit', 'Hendrik', 'Francois',
        'Mandla', 'Sibusiso', 'Mduduzi', 'Bhekani', 'Msizi', 'Nhlanhla',
        'Lerato', 'Motse', 'Ntabo', 'Keabetswe', 'Lesego', 'Otlile', 'Setlhomamaru',
        'Vusi', 'Wiseman', 'Siyanda', 'Lonwabo', 'Ayanda', 'Bulelani', 'Litha',
    ];

    private const FEMALE_NAMES = [
        'Nomsa', 'Zanele', 'Thandeka', 'Bongiwe', 'Nolwazi', 'Asanda', 'Nokukhanya',
        'Nthabiseng', 'Kgomotso', 'Refilwe', 'Lerato', 'Keamogetse', 'Boitumelo',
        'Ditshego', 'Fhulufhelo', 'Tshilidzi', 'Shonisani', 'Vuyelwa', 'Cynthia',
        'Lindiwe', 'Nosipho', 'Nokwanda', 'Zinhle', 'Nompumelelo', 'Nonhlanhla',
        'Buhle', 'Nandi', 'Ntombi', 'Nomcebo', 'Lungile', 'Hlengiwe', 'Nobuhle',
        'Maria', 'Anna', 'Elizabeth', 'Grace', 'Faith', 'Hope', 'Patience',
        'Marie', 'Anri', 'Elmari', 'Hanli', 'Ronel', 'Marlize', 'Suzette',
        'Noxolo', 'Nomvula', 'Nokuthula', 'Nokukhanya', 'Nozipho', 'Nomathemba',
        'Palesa', 'Mpho', 'Precious', 'Blessing', 'Gift', 'Beauty', 'Gladness',
    ];

    private const SURNAMES = [
        'Dlamini', 'Nkosi', 'Zulu', 'Mthembu', 'Khumalo', 'Ndlovu', 'Mkhize',
        'Molefe', 'Sithole', 'Mahlangu', 'Vilakazi', 'Nxumalo', 'Ntuli', 'Mthethwa',
        'Cele', 'Msweli', 'Shabalala', 'Radebe', 'Mokoena', 'Masondo',
        'Mnguni', 'Mthombeni', 'Buthelezi', 'Khoza', 'Majola', 'Ngcobo',
        'Magwaza', 'Mbatha', 'Mthiyane', 'Gwala', 'Mhlongo', 'Mthiyane',
        'Motsepe', 'Lekota', 'Mbalula', 'Ramaphosa', 'Modise', 'Mokgosi',
        'Nkwanyana', 'Zwane', 'Maseko', 'Simelane', 'Dube', 'Mabuza',
        'Van der Berg', 'Botha', 'Du Plessis', 'Pretorius', 'Joubert', 'Venter',
        'Luthuli', 'Bhengu', 'Mseleku', 'Ndaba', 'Mhlaba', 'Mzaidume',
        'Tshwete', 'Hlatswayo', 'Gumbi', 'Mcineka', 'Nzama', 'Ntanzi',
        'Phiri', 'Banda', 'Moyo', 'Ngwenya', 'Mpofu', 'Sibanda', 'Ncube',
        'Tshabalala', 'Mabuza', 'Magagula', 'Mnisi', 'Mathebula', 'Ngomane',
        'Mudau', 'Mukhwevho', 'Mulaudzi', 'Ramavhoya', 'Nedzamba', 'Tshivhase',
    ];

    private const STREET_NAMES = [
        'Mandela Drive', 'Biko Street', 'Sobukwe Road', 'Tambo Avenue', 'Sisulu Street',
        'Freedom Road', 'Liberation Avenue', 'Unity Street', 'Peace Drive', 'Hope Road',
        'Church Street', 'Station Road', 'Main Street', 'Market Street', 'Park Avenue',
        'Khumalo Street', 'Dlamini Road', 'Nkosi Drive', 'Zulu Avenue', 'Ndlovu Street',
        'Mahlangu Road', 'Vilakazi Drive', 'Ntuli Street', 'Cele Road', 'Shabalala Ave',
        'Radebe Street', 'Mokoena Drive', 'Buthelezi Road', 'Mkhize Avenue', 'Sithole St',
        'Struggle Road', 'Sunrise Avenue', 'Rainbow Street', 'Ubuntu Drive', 'Thabo Street',
    ];

    // ─── SASSA grant types and amounts ─────────────────────────────────────

    private const GRANT_TYPES = [
        ['amount' => 350.00,  'label' => 'SRD R350',             'weight' => 60],
        ['amount' => 1890.00, 'label' => 'Old Age Pension',      'weight' => 20],
        ['amount' => 1890.00, 'label' => 'Disability Grant',     'weight' => 10],
        ['amount' => 480.00,  'label' => 'Child Support Grant',  'weight' => 10],
    ];

    public function __construct(private readonly Connection $connection)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('fresh', null, InputOption::VALUE_NONE, 'Delete existing e-Khadi seed data before re-seeding');
        $this->addOption('customers', null, InputOption::VALUE_OPTIONAL, 'Number of customers to generate', 1000);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('e-Khadi Seed — South African Demo Data');

        if ($input->getOption('fresh')) {
            $io->warning('Clearing existing e-Khadi data…');
            $this->clearEkhadiData();
        }

        $customerCount = (int) $input->getOption('customers');

        // ── 1. Resolve Shopware FK dependencies ──────────────────────────
        $io->section('Resolving Shopware dependencies');
        $deps = $this->resolveDependencies($io);
        if ($deps === null) {
            return Command::FAILURE;
        }

        // ── 2. Create 180 areas (9 provinces × 20) ───────────────────────
        $io->section('Creating 9 provinces × 20 areas = 180 areas');
        $areaIdsByProvince = $this->seedAreas($io);

        // ── 3. Create customers ───────────────────────────────────────────
        $io->section("Creating $customerCount customers with SA profiles");
        $allAreaIds    = array_merge(...array_values($areaIdsByProvince));
        $customerIds   = $this->seedCustomers($customerCount, $allAreaIds, $deps, $io);

        // ── 4. Build area → customer map for group assignment ─────────────
        $io->section('Assigning customers to stokvel groups (80 groups)');
        $this->seedGroupsAndMembers($areaIdsByProvince, $customerIds, $io);

        // ── 5. Seed grant cycle history (6 months per customer sample) ────
        $io->section('Seeding grant cycle history for 200 sample customers');
        $this->seedGrantCycles(array_slice($customerIds, 0, 200), $io);

        // ── 6. Seed credit requests ───────────────────────────────────────
        $io->section('Seeding mid-month credit requests');
        $this->seedCreditRequests(array_slice($customerIds, 0, 300), $io);

        $io->success([
            '180 areas across 9 provinces',
            "$customerCount customers with e-Khadi profiles",
            '80 stokvel groups with wallets and buckets',
            'Grant cycle history and credit requests seeded',
            'Login password for all seed users: eKhadi@2025!',
        ]);

        return Command::SUCCESS;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 0: Resolve Shopware FK dependencies
    // ─────────────────────────────────────────────────────────────────────────

    private function resolveDependencies(SymfonyStyle $io): ?array
    {
        $salesChannelId = $this->connection->fetchOne(
            "SELECT id FROM sales_channel WHERE type_id = UNHEX(REPLACE('8a243080f92e4c719546314b577cf82b', '-', '')) LIMIT 1"
        );
        if (!$salesChannelId) {
            // Fallback: any sales channel
            $salesChannelId = $this->connection->fetchOne('SELECT id FROM sales_channel LIMIT 1');
        }

        $customerGroupId = $this->connection->fetchOne('SELECT id FROM customer_group LIMIT 1');
        $salutationId    = $this->connection->fetchOne("SELECT id FROM salutation WHERE salutation_key IN ('mr','mrs','miss','ms','not_specified') LIMIT 1");
        $countryId       = $this->connection->fetchOne("SELECT id FROM country WHERE iso = 'ZA' LIMIT 1");

        if (!$salesChannelId || !$customerGroupId) {
            $io->error('Could not find a sales channel or customer group. Is Shopware installed correctly?');
            return null;
        }

        if (!$countryId) {
            $io->warning('South Africa (ZA) not found in country table. Using first available country.');
            $countryId = $this->connection->fetchOne('SELECT id FROM country WHERE active = 1 LIMIT 1');
        }

        if (!$salutationId) {
            $salutationId = $this->connection->fetchOne('SELECT id FROM salutation LIMIT 1');
        }

        $io->text([
            '✓ Sales channel found',
            '✓ Customer group found',
            '✓ Country (ZA) resolved',
            '✓ Salutation resolved',
        ]);

        return compact('salesChannelId', 'customerGroupId', 'salutationId', 'countryId');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Seed 180 areas
    // ─────────────────────────────────────────────────────────────────────────

    private function seedAreas(SymfonyStyle $io): array
    {
        $areaIdsByProvince = [];
        $now               = $this->now();

        foreach (self::PROVINCES as $province => $areas) {
            $provinceAreaIds = [];

            foreach ($areas as $areaName) {
                // Idempotent: skip if already exists
                $exists = $this->connection->fetchOne(
                    'SELECT id FROM ekhadi_area WHERE name = ?',
                    [$areaName]
                );

                if ($exists) {
                    $provinceAreaIds[] = $exists;
                    continue;
                }

                $id = Uuid::fromHexToBytes(Uuid::randomHex());
                $this->connection->insert('ekhadi_area', [
                    'id'          => $id,
                    'name'        => $areaName,
                    'description' => "Township/area in $province",
                    'province'    => $province,
                    'created_at'  => $now,
                ]);
                $provinceAreaIds[] = $id;
            }

            $areaIdsByProvince[$province] = $provinceAreaIds;
            $io->text("  ✓ $province — " . count($provinceAreaIds) . ' areas');
        }

        return $areaIdsByProvince;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Seed 1 000 customers
    // ─────────────────────────────────────────────────────────────────────────

    private function seedCustomers(int $count, array $allAreaIds, array $deps, SymfonyStyle $io): array
    {
        $customerIds    = [];
        $passwordHash   = password_hash('eKhadi@2025!', PASSWORD_BCRYPT);
        $now            = $this->now();
        $progressStep   = max(1, (int) ($count / 10));

        for ($i = 1; $i <= $count; $i++) {
            $gender    = $i % 3 === 0 ? 'female' : 'male';
            $firstName = $this->randomName($gender);
            $lastName  = $this->randomItem(self::SURNAMES);
            $email     = strtolower(preg_replace('/\s+/', '.', "$firstName.$lastName.$i")) . '@ekhadi.co.za';
            $phone     = '+27' . (60 + rand(0, 9)) . rand(1000000, 9999999);
            $street    = rand(1, 999) . ' ' . $this->randomItem(self::STREET_NAMES);
            $areaId    = $allAreaIds[($i - 1) % count($allAreaIds)];
            $areaName  = $this->connection->fetchOne('SELECT name FROM ekhadi_area WHERE id = ?', [$areaId]);
            $province  = $this->connection->fetchOne('SELECT province FROM ekhadi_area WHERE id = ?', [$areaId]);
            $postcode  = (string) rand(1000, 9999);

            $customerId = Uuid::fromHexToBytes(Uuid::randomHex());
            $addressId  = Uuid::fromHexToBytes(Uuid::randomHex());

            // Customer address
            $this->connection->insert('customer_address', [
                'id'           => $addressId,
                'customer_id'  => $customerId,
                'country_id'   => $deps['countryId'],
                'salutation_id'=> $deps['salutationId'],
                'first_name'   => $firstName,
                'last_name'    => $lastName,
                'street'       => $street,
                'city'         => $areaName ?: 'Johannesburg',
                'zipcode'      => $postcode,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);

            // Shopware customer
            $customerNumber = 'EKH' . str_pad((string) $i, 6, '0', STR_PAD_LEFT);
            $this->connection->insert('customer', [
                'id'                         => $customerId,
                'customer_number'            => $customerNumber,
                'sales_channel_id'           => $deps['salesChannelId'],
                'default_billing_address_id' => $addressId,
                'default_shipping_address_id'=> $addressId,
                'customer_group_id'          => $deps['customerGroupId'],
                'salutation_id'              => $deps['salutationId'],
                'first_name'                 => $firstName,
                'last_name'                  => $lastName,
                'email'                      => $email,
                'password'                   => $passwordHash,
                'active'                     => 1,
                'guest'                      => 0,
                'created_at'                 => $now,
                'updated_at'                 => $now,
            ]);

            $customerIds[] = $customerId;

            // e-Khadi customer profile
            $grant          = $this->weightedGrant();
            $grantPayDay    = rand(1, 5); // SASSA pays 1st–5th of month
            $creditLimit    = min(300.0, max(50.0, round($grant['amount'] * 0.30, 2)));

            $this->connection->insert('ekhadi_customer_profile', [
                'id'                 => Uuid::fromHexToBytes(Uuid::randomHex()),
                'customer_id'        => $customerId,
                'area_id'            => $areaId,
                'is_grant_recipient' => 1,
                'grant_amount'       => $grant['amount'],
                'grant_pay_day'      => $grantPayDay,
                'credit_limit'       => $creditLimit,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);

            if ($i % $progressStep === 0) {
                $io->text("  … $i / $count customers created");
            }
        }

        $io->text("  ✓ $count customers with profiles created");
        return $customerIds;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Seed 80 stokvel groups (roughly one per 2–3 areas)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedGroupsAndMembers(array $areaIdsByProvince, array $customerIds, SymfonyStyle $io): void
    {
        $now      = $this->now();
        $groupIdx = 0;

        // Currency: ZAR
        $zarId = $this->connection->fetchOne("SELECT id FROM currency WHERE iso_code = 'ZAR' LIMIT 1");

        foreach (array_keys(self::PROVINCES) as $province) {
            $provinceAreaIds = $areaIdsByProvince[$province] ?? [];

            // 8–9 groups per province → ~80 total
            for ($g = 0; $g < 9; $g++) {
                $areaId    = $provinceAreaIds[$g % count($provinceAreaIds)];
                $areaName  = $this->connection->fetchOne('SELECT name FROM ekhadi_area WHERE id = ?', [$areaId]);
                $groupName = "Ikageng Stokvel — $areaName";

                $groupId  = Uuid::fromHexToBytes(Uuid::randomHex());
                $walletId = Uuid::fromHexToBytes(Uuid::randomHex());

                // Create group
                $this->connection->insert('ekhadi_group', [
                    'id'               => $groupId,
                    'name'             => $groupName,
                    'description'      => "Community rotating savings group serving $areaName, $province",
                    'status'           => 'active',
                    'max_members'      => 15,
                    'contribution_day' => rand(1, 5),
                    'currency_id'      => $zarId ?: null,
                    'area_id'          => $areaId,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ]);

                // Create wallet
                $walletBalance = rand(500, 5000) + (rand(0, 99) / 100);
                $this->connection->insert('ekhadi_group_wallet', [
                    'id'          => $walletId,
                    'group_id'    => $groupId,
                    'balance'     => $walletBalance,
                    'currency_id' => $zarId ?: null,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);

                // Create buckets for each essential type
                $bucketTypes = ['food', 'medicine', 'toiletries', 'electricity', 'baby_products'];
                foreach ($bucketTypes as $type) {
                    $bucketBalance = round($walletBalance / count($bucketTypes), 2);
                    $this->connection->insert('ekhadi_group_bucket', [
                        'id'                 => Uuid::fromHexToBytes(Uuid::randomHex()),
                        'wallet_id'          => $walletId,
                        'bucket_type'        => $type,
                        'balance'            => $bucketBalance,
                        'allowed_categories' => null,
                        'created_at'         => $now,
                        'updated_at'         => $now,
                    ]);
                }

                // Assign 10–12 members from the customer pool (cycled across groups)
                $memberCount = rand(10, 12);
                $addedCount  = 0;
                $adminSet    = false;

                for ($m = 0; $m < $memberCount; $m++) {
                    $cidIdx     = ($groupIdx * $memberCount + $m) % count($customerIds);
                    $customerId = $customerIds[$cidIdx];

                    // Skip if customer already in this group (unlikely but safe)
                    $exists = $this->connection->fetchOne(
                        'SELECT id FROM ekhadi_group_member WHERE group_id = ? AND customer_id = ?',
                        [$groupId, $customerId]
                    );
                    if ($exists) continue;

                    $role = !$adminSet ? 'admin' : 'member';
                    $adminSet = true;

                    $this->connection->insert('ekhadi_group_member', [
                        'id'                 => Uuid::fromHexToBytes(Uuid::randomHex()),
                        'group_id'           => $groupId,
                        'customer_id'        => $customerId,
                        'role'               => $role,
                        'status'             => 'active',
                        'join_date'          => date('Y-m-d H:i:s.000', strtotime('-' . rand(30, 365) . ' days')),
                        'monthly_commitment' => [100.00, 150.00, 200.00, 250.00][rand(0, 3)],
                        'created_at'         => $now,
                        'updated_at'         => $now,
                    ]);

                    ++$addedCount;
                }

                // Schedule rotation cycles for the group
                $this->seedRotationCycles($groupId, $addedCount, $areaId, $now);

                ++$groupIdx;
            }

            $io->text("  ✓ $province — 9 groups with wallets, buckets, members");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: Seed rotation cycles for a group
    // ─────────────────────────────────────────────────────────────────────────

    private function seedRotationCycles(string $groupId, int $memberCount, string $areaId, string $now): void
    {
        $members = $this->connection->fetchAllAssociative(
            'SELECT id, customer_id FROM ekhadi_group_member WHERE group_id = ? AND status = ?',
            [$groupId, 'active']
        );

        if (empty($members)) return;

        $cycleStart = new \DateTime('first day of this month');

        foreach ($members as $idx => $member) {
            $cycleEnd  = (clone $cycleStart)->modify('+1 month -1 day');
            $status    = match (true) {
                $idx === 0 => 'active',
                $idx < 3   => 'completed',
                default    => 'pending',
            };
            $payoutAmt = $idx < 3 ? round(rand(800, 2500) + rand(0, 99) / 100, 2) : 0.00;

            $this->connection->insert('ekhadi_rotation_cycle', [
                'id'                       => Uuid::fromHexToBytes(Uuid::randomHex()),
                'group_id'                 => $groupId,
                'cycle_number'             => $idx + 1,
                'beneficiary_customer_id'  => $member['customer_id'],
                'start_date'               => $cycleStart->format('Y-m-d H:i:s.000'),
                'end_date'                 => $cycleEnd->format('Y-m-d H:i:s.000'),
                'status'                   => $status,
                'payout_amount'            => $payoutAmt,
                'created_at'               => $now,
                'updated_at'               => $now,
            ]);

            $cycleStart->modify('+1 month');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Seed grant cycle history
    // ─────────────────────────────────────────────────────────────────────────

    private function seedGrantCycles(array $customerIds, SymfonyStyle $io): void
    {
        $now = $this->now();

        foreach ($customerIds as $customerId) {
            $profile = $this->connection->fetchAssociative(
                'SELECT grant_amount, grant_pay_day FROM ekhadi_customer_profile WHERE customer_id = ?',
                [$customerId]
            );
            if (!$profile) continue;

            $grantAmount = (float) $profile['grant_amount'];
            $payDay      = (int) $profile['grant_pay_day'];

            // 6 months of history
            for ($month = 5; $month >= 0; $month--) {
                $payDate    = new \DateTime("$month months ago");
                $payDate->setDate((int) $payDate->format('Y'), (int) $payDate->format('m'), min($payDay, (int) $payDate->format('t')));
                $cycleEnd   = (clone $payDate)->modify('+1 month -1 day');
                $status     = $month === 0 ? 'active' : 'completed';
                $spent      = round($grantAmount * (rand(60, 95) / 100), 2);
                $riskScore  = $month === 0 ? rand(20, 75) : rand(0, 30);

                $this->connection->insert('ekhadi_grant_cycle', [
                    'id'                   => Uuid::fromHexToBytes(Uuid::randomHex()),
                    'customer_id'          => $customerId,
                    'grant_amount'         => $grantAmount,
                    'payment_date'         => $payDate->format('Y-m-d H:i:s.000'),
                    'cycle_start'          => $payDate->format('Y-m-d H:i:s.000'),
                    'cycle_end'            => $cycleEnd->format('Y-m-d H:i:s.000'),
                    'amount_spent'         => $status === 'active' ? $spent * (rand(30, 60) / 100) : $spent,
                    'shortfall_risk_score' => $riskScore,
                    'status'               => $status,
                    'created_at'           => $now,
                    'updated_at'           => $now,
                ]);
            }
        }

        $io->text('  ✓ 6 months grant cycle history for ' . count($customerIds) . ' customers');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Seed credit requests with varied statuses
    // ─────────────────────────────────────────────────────────────────────────

    private function seedCreditRequests(array $customerIds, SymfonyStyle $io): void
    {
        $now         = $this->now();
        $bucketTypes = ['food', 'medicine', 'toiletries', 'electricity', 'baby_products'];
        $statuses    = [
            'pending'  => 30,
            'approved' => 30,
            'rejected' => 15,
            'repaid'   => 25,
        ];
        $statusPool  = [];
        foreach ($statuses as $s => $weight) {
            for ($w = 0; $w < $weight; $w++) {
                $statusPool[] = $s;
            }
        }

        $count = 0;
        foreach ($customerIds as $cidIdx => $customerId) {
            // Not every customer has a request
            if ($cidIdx % 3 !== 0) continue;

            $groupMember = $this->connection->fetchAssociative(
                'SELECT group_id FROM ekhadi_group_member WHERE customer_id = ? AND status = ? LIMIT 1',
                [$customerId, 'active']
            );
            if (!$groupMember) continue;

            $amount     = [50, 75, 100, 150, 200, 250, 300][rand(0, 6)] * 1.0;
            $status     = $statusPool[rand(0, count($statusPool) - 1)];
            $bucketType = $this->randomItem($bucketTypes);
            $reasons    = [
                'Need food for the children before next grant',
                'Medicine — chronic medication finished mid-month',
                'Baby formula and nappies urgently needed',
                'Electricity prepaid token — lights off since yesterday',
                'Soap, toothpaste and washing powder for the family',
                'Cooking oil and bread for the week',
            ];

            $requestId = Uuid::fromHexToBytes(Uuid::randomHex());
            $this->connection->insert('ekhadi_credit_request', [
                'id'                     => $requestId,
                'group_id'               => $groupMember['group_id'],
                'requester_customer_id'  => $customerId,
                'bucket_type'            => $bucketType,
                'amount'                 => $amount,
                'reason'                 => $this->randomItem($reasons),
                'status'                 => $status,
                'approvals_count'        => in_array($status, ['approved', 'repaid']) ? 2 : rand(0, 1),
                'required_approvals'     => 2,
                'approved_by'            => null,
                'repayment_date'         => date('Y-m-d H:i:s.000', strtotime('+' . rand(10, 28) . ' days')),
                'repaid_at'              => $status === 'repaid' ? date('Y-m-d H:i:s.000', strtotime('-' . rand(1, 20) . ' days')) : null,
                'created_at'             => $now,
                'updated_at'             => $now,
            ]);

            // Add repayment schedule for approved/pending repayment
            if ($status === 'approved') {
                $fee = round($amount * 0.02, 2);
                $this->connection->insert('ekhadi_repayment_schedule', [
                    'id'                 => Uuid::fromHexToBytes(Uuid::randomHex()),
                    'customer_id'        => $customerId,
                    'principal_owed'     => $amount,
                    'fee_amount'         => $fee,
                    'total_amount_owed'  => $amount + $fee,
                    'due_date'           => date('Y-m-d H:i:s.000', strtotime('+' . rand(5, 25) . ' days')),
                    'status'             => 'pending',
                    'credit_request_ids' => json_encode([bin2hex($requestId)]),
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ]);
            }

            ++$count;
        }

        $io->text("  ✓ $count credit requests seeded (mixed statuses)");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fresh wipe
    // ─────────────────────────────────────────────────────────────────────────

    private function clearEkhadiData(): void
    {
        $tables = [
            'ekhadi_repayment_schedule',
            'ekhadi_credit_request',
            'ekhadi_grant_cycle',
            'ekhadi_rotation_cycle',
            'ekhadi_group_bucket',
            'ekhadi_group_wallet',
            'ekhadi_group_member',
            'ekhadi_group',
            'ekhadi_area_shop',
            'ekhadi_customer_profile',
            'ekhadi_area',
        ];

        $this->connection->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($tables as $table) {
            $this->connection->executeStatement("TRUNCATE TABLE `$table`");
        }
        $this->connection->executeStatement('SET FOREIGN_KEY_CHECKS = 1');

        // Remove seed customers (identified by customer_number prefix EKH)
        $this->connection->executeStatement(
            "DELETE ca FROM customer_address ca
             INNER JOIN customer c ON ca.customer_id = c.id
             WHERE c.customer_number LIKE 'EKH%'"
        );
        $this->connection->executeStatement("DELETE FROM customer WHERE customer_number LIKE 'EKH%'");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilities
    // ─────────────────────────────────────────────────────────────────────────

    private function randomName(string $gender): string
    {
        return $gender === 'female'
            ? self::FEMALE_NAMES[rand(0, count(self::FEMALE_NAMES) - 1)]
            : self::MALE_NAMES[rand(0, count(self::MALE_NAMES) - 1)];
    }

    private function randomItem(array $items): string
    {
        return $items[rand(0, count($items) - 1)];
    }

    private function weightedGrant(): array
    {
        $pool = [];
        foreach (self::GRANT_TYPES as $grant) {
            for ($w = 0; $w < $grant['weight']; $w++) {
                $pool[] = $grant;
            }
        }
        return $pool[rand(0, count($pool) - 1)];
    }

    private function now(): string
    {
        return (new \DateTime())->format('Y-m-d H:i:s.000');
    }
}
