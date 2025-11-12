// Global data storage
let allPlayers = [];
let filteredPlayers = [];
let selectedPlayers = [];
let playerConfigs = {}; // Map player name to their config data
let pinnedPlayers = new Set(); // Set of pinned player names

// Chart instances
let winRateChart = null;
let ratingChart = null;
let gameStatsChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayerConfigs();
    loadData();
    setupEventListeners();
    initializeTheme();
});

// Embedded CSV data (to avoid CORS issues when opening file directly)
const csvData = `Rank,Player,Rating_Mu,Rating_Sigma,Wins,Draws,Losses,Games,Win_Rate
1,mutolovincent,43.86,3.48,12,0,0,12,1.000
2,aoorange,38.80,2.91,10,1,1,12,0.833
3,yujiehang,36.33,2.85,8,0,3,11,0.727
4,pengjinjun,34.17,2.85,7,1,3,11,0.636
5,yangganxiang,34.16,2.65,7,1,4,12,0.583
6,yenaimeng,34.04,2.62,7,2,3,12,0.583
7,shanzhihao,31.55,2.54,6,2,4,12,0.500
8,liuwenxuan,31.31,2.61,6,1,5,12,0.500
9,agrawalom,31.09,2.82,7,0,5,12,0.583
10,schuettmaximilian,30.21,2.65,6,1,5,12,0.500
11,zhenggary,29.39,2.69,5,1,6,12,0.417
12,zhaoweiliang,29.17,2.61,7,1,4,12,0.583
13,wangarabella,28.70,2.54,6,2,4,12,0.500
14,enchristopher,27.80,2.59,5,1,6,12,0.417
15,zhutianlei,27.23,2.56,7,1,4,12,0.583
16,wangyuan,25.69,2.61,5,1,6,12,0.417
17,chenyufei,25.15,2.52,4,2,6,12,0.333
18,venkatanarayanannaveen,25.11,2.49,6,2,4,12,0.500
19,listeven,24.60,2.66,6,0,6,12,0.500
20,zhouevan,23.79,2.61,7,0,5,12,0.583
21,wangsherry,23.61,2.64,6,1,5,12,0.500
22,davidmatteo,23.02,2.59,4,1,7,12,0.333
23,sunclaire,22.88,2.62,4,1,7,12,0.333
24,fangyuan,22.43,2.68,7,0,5,12,0.583
25,niruichen,20.55,2.61,5,1,6,12,0.417
26,huangziyu,19.73,2.64,4,1,7,12,0.333
27,xiaoyue,19.59,2.60,3,1,8,12,0.250
28,zhangkarina,18.38,2.69,5,0,7,12,0.417
29,srivastavaaayush,18.34,2.73,5,0,7,12,0.417
30,zhangjingwen,18.13,2.73,4,1,7,12,0.333
31,wanganda,16.38,2.60,4,1,7,12,0.333
32,zhuruby,16.11,2.91,4,0,6,10,0.400
33,singhsanjeevan,14.69,3.09,3,0,7,10,0.300
34,lunamugicajose,13.94,2.84,3,0,8,11,0.273
35,litvakron,11.23,2.85,2,0,10,12,0.167
36,linjiayi,8.79,3.16,1,0,10,11,0.091`;

// Map player names to their config filenames
const playerConfigFiles = {
    'mutolovincent': 'mutolovincent_660111_25380863_config.yml',
    'aoorange': 'aoorange_722540_25372279_config-2.yml',
    'yujiehang': 'yujiehang_596718_25359060_config.yml',
    'pengjinjun': 'pengjinjun_657484_25363213_config.yml',
    'yangganxiang': 'yangganxiang_737248_25349835_config-6.yml',
    'yenaimeng': 'yenaimeng_LATE_605475_25475845_yenaimeng_LATE_605475_25474277_config.yml',
    'shanzhihao': 'shanzhihao_733390_25385717_config.yml',
    'liuwenxuan': 'liuwenxuan_LATE_749142_25390122_config.yml',
    'agrawalom': 'agrawalom_737988_25383356_config_v13.yml',
    'schuettmaximilian': 'schuettmaximilian_742091_25384969_config.yml',
    'zhenggary': 'zhenggary_736563_25357709_config.yml',
    'zhaoweiliang': 'zhaoweiliang_668422_25383613_config.yml',
    'wangarabella': 'wangarabella_736620_25345819_config.yml',
    'enchristopher': 'enchristopher_602285_25348856_config.yml',
    'zhutianlei': 'zhutianlei_732667_25376948_config.yml',
    'wangyuan': 'wangyuan_736533_25383342_config.yml',
    'chenyufei': 'chenyufei_662534_25342365_config.yml',
    'venkatanarayanannaveen': 'venkatanarayanannaveen_764261_25385794_config.yml',
    'listeven': 'listeven_736587_25386131_config.yml',
    'zhouevan': 'zhouevan_663610_25377311_congfig.yml',
    'wangsherry': 'wangsherry_738330_25385663_config.yml',
    'davidmatteo': 'davidmatteo_749038_25383022_config.yml',
    'sunclaire': 'sunclaire_733356_25370888_config.yml',
    'fangyuan': 'fangyuan_LATE_736625_25402497_config.yml',
    'niruichen': 'niruichen_749387_25381152_config.yml',
    'huangziyu': 'huangziyu_600639_25345415_config.yml',
    'xiaoyue': 'xiaoyue_736540_25350835_config.yml',
    'zhangkarina': 'zhangkarina_666586_25359184_config.yml',
    'srivastavaaayush': 'srivastavaaayush_LATE_732701_25389500_config.yml',
    'zhangjingwen': 'zhangjingwen_412991_25379656_config.yml',
    'wanganda': 'wanganda_736635_25292697_config.yml',
    'zhuruby': 'zhuruby_736383_25337304_config_1013.yml',
    'singhsanjeevan': 'singhsanjeevan_806110_25385314_config.yml',
    'lunamugicajose': 'lunamugicajose_722218_25384298_config_JML.yml',
    'litvakron': 'litvakron_LATE_721981_25391228_Config.yml',
    'linjiayi': 'linjiayi_742390_25311749_config.yml'
};

// Embedded model data (extracted from YAML configs to avoid CORS issues)
const embeddedPlayerModels = {
    'mutolovincent': { provider: 'OpenAI', name: 'gpt-5-mini' },
    'aoorange': { provider: 'OpenAI', name: 'gpt-5-mini-2025-08-07' },
    'yujiehang': { provider: 'OpenAI', name: 'gpt-5-mini' },
    'pengjinjun': { provider: 'OpenAI', name: 'gpt-5-mini' },
    'yangganxiang': { provider: 'OpenAI', name: 'gpt-5-mini' },
    'yenaimeng': { provider: 'OpenAI', name: 'gpt-5-mini-2025-08-07' },
    'shanzhihao': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash-preview-09-2025' },
    'liuwenxuan': { provider: 'OpenRouter', name: 'openai/o1' },
    'agrawalom': { provider: 'OpenRouter', name: 'deepseek/deepseek-chat-v3.1' },
    'schuettmaximilian': { provider: 'OpenAI', name: 'o4-mini' },
    'zhenggary': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'zhaoweiliang': { provider: 'OpenAI', name: 'gpt-5-mini' },
    'wangarabella': { provider: 'OpenAI', name: 'gpt-4.1-mini' },
    'enchristopher': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'zhutianlei': { provider: 'OpenRouter', name: 'deepseek/deepseek-chat-v3.1' },
    'wangyuan': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'chenyufei': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'venkatanarayanannaveen': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'listeven': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'zhouevan': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'wangsherry': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'davidmatteo': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'sunclaire': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'fangyuan': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'niruichen': { provider: 'OpenAI', name: 'gpt-4o' },
    'huangziyu': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'xiaoyue': { provider: 'OpenRouter', name: 'gpt-4o-mini' },
    'zhangkarina': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'srivastavaaayush': { provider: 'OpenRouter', name: 'anthropic/claude-3.5-haiku:beta' },
    'zhangjingwen': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'wanganda': { provider: 'OpenAI', name: 'gpt-4o-mini' },
    'zhuruby': { provider: 'OpenRouter', name: 'google/gemini-2.5-flash' },
    'singhsanjeevan': { provider: 'OpenRouter', name: 'moonshotai/kimi-k2-0905' },
    'lunamugicajose': { provider: 'OpenRouter', name: 'deepseek/deepseek-r1-0528' },
    'litvakron': { provider: 'OpenRouter', name: 'openai/gpt-5-mini' },
    'linjiayi': { provider: 'OpenRouter', name: 'openai/gpt-4o-mini' }
};

// Load player configs from YAML files (for prompts, model data is embedded above)
async function loadPlayerConfigs() {
    // First, set model data from embedded data
    for (const [playerName, modelData] of Object.entries(embeddedPlayerModels)) {
        if (!playerConfigs[playerName]) {
            playerConfigs[playerName] = {
                model: modelData,
                systemPrompt: '',
                stepWisePrompt: ''
            };
        } else {
            playerConfigs[playerName].model = modelData;
        }
    }
    
    // Try to load prompts from YAML files - if CORS blocks it, prompts will be empty
    for (const [playerName, filename] of Object.entries(playerConfigFiles)) {
        try {
            const response = await fetch(`data/prompt_collection/${filename}`);
            if (response.ok) {
                const yamlText = await response.text();
                const config = jsyaml.load(yamlText);
                
                // Extract agent0 prompts
                if (config.agent0 && config.agent0.prompts) {
                    if (!playerConfigs[playerName]) {
                        playerConfigs[playerName] = {
                            model: embeddedPlayerModels[playerName] || { provider: 'Unknown', name: 'Not available' },
                            systemPrompt: '',
                            stepWisePrompt: ''
                        };
                    }
                    playerConfigs[playerName].systemPrompt = config.agent0.prompts.system_prompt || '';
                    playerConfigs[playerName].stepWisePrompt = config.agent0.prompts.step_wise_prompt || '';
                }
            }
        } catch (error) {
            // If fetch fails (CORS), prompts will remain empty but model info is already set
            console.warn(`Could not load prompts for ${playerName}:`, error);
        }
    }
}

// Toggle pin for a player
function togglePin(playerName) {
    if (pinnedPlayers.has(playerName)) {
        pinnedPlayers.delete(playerName);
    } else {
        pinnedPlayers.add(playerName);
    }
    applyFilters(); // Re-render with new pin state
}

// Load CSV data
function loadData() {
    try {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');
        
        allPlayers = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                rank: parseInt(values[0]),
                player: values[1],
                ratingMu: parseFloat(values[2]),
                ratingSigma: parseFloat(values[3]),
                wins: parseInt(values[4]),
                draws: parseInt(values[5]),
                losses: parseInt(values[6]),
                games: parseInt(values[7]),
                winRate: parseFloat(values[8])
            };
        });
        
        filteredPlayers = [...allPlayers];
        updateStatsOverview();
        renderLeaderboard();
        renderCharts();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading tournament data: ' + error.message);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    
    // Filters
    document.getElementById('top10Filter').addEventListener('change', handleFilter);
    document.getElementById('perfectFilter').addEventListener('change', handleFilter);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Update charts for theme change
    if (winRateChart) winRateChart.update();
    if (ratingChart) ratingChart.update();
    if (gameStatsChart) gameStatsChart.update();
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    applyFilters();
}

// Handle sort
function handleSort(e) {
    const sortBy = e.target.value;
    applyFilters();
}

// Handle filters
function handleFilter() {
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    let filtered = [...allPlayers];
    
    // Search filter
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    if (searchQuery) {
        filtered = filtered.filter(p => p.player.toLowerCase().includes(searchQuery));
    }
    
    // Top 10 filter
    if (document.getElementById('top10Filter').checked) {
        filtered = filtered.filter(p => p.rank <= 10);
    }
    
    // Perfect record filter
    if (document.getElementById('perfectFilter').checked) {
        filtered = filtered.filter(p => p.winRate === 1.0);
    }
    
    // Sort
    const sortBy = document.getElementById('sortSelect').value;
    filtered.sort((a, b) => {
        // First, separate pinned and unpinned players
        const aPinned = pinnedPlayers.has(a.player);
        const bPinned = pinnedPlayers.has(b.player);
        
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        
        // If both pinned or both unpinned, sort normally
        switch(sortBy) {
            case 'rank':
                return a.rank - b.rank;
            case 'rating':
                return b.ratingMu - a.ratingMu;
            case 'winRate':
                return b.winRate - a.winRate;
            case 'wins':
                return b.wins - a.wins;
            case 'games':
                return b.games - a.games;
            default:
                return 0;
        }
    });
    
    filteredPlayers = filtered;
    renderLeaderboard();
    renderCharts();
}

// Update stats overview
function updateStatsOverview() {
    const totalPlayers = allPlayers.length;
    const avgRating = allPlayers.reduce((sum, p) => sum + p.ratingMu, 0) / totalPlayers;
    const avgWinRate = allPlayers.reduce((sum, p) => sum + p.winRate, 0) / totalPlayers;
    const totalGames = allPlayers.reduce((sum, p) => sum + p.games, 0);
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('avgRating').textContent = avgRating.toFixed(2);
    document.getElementById('avgWinRate').textContent = (avgWinRate * 100).toFixed(1) + '%';
    document.getElementById('totalGames').textContent = totalGames;
}

// Render leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    filteredPlayers.forEach(player => {
        const row = document.createElement('tr');
        
        // Apply highlighting classes
        if (player.rank <= 3) {
            row.classList.add('top-player');
        }
        if (player.winRate > 0.8) {
            row.classList.add('high-win-rate');
        }
        if (pinnedPlayers.has(player.player)) {
            row.classList.add('pinned');
        }
        
        const rankBadge = getRankBadge(player.rank);
        const winRatePercent = (player.winRate * 100).toFixed(1);
        const isPinned = pinnedPlayers.has(player.player);
        const config = playerConfigs[player.player] || { model: { provider: 'Unknown', name: 'Not available' } };
        const modelDisplay = config.model.name !== 'Not available' 
            ? `<span class="model-info">${config.model.name}</span><br><span class="model-provider">${config.model.provider}</span>`
            : '<span class="model-info">Not available</span>';
        
        row.innerHTML = `
            <td>
                <button class="pin-btn ${isPinned ? 'pinned' : ''}" onclick="togglePin('${player.player}')" title="${isPinned ? 'Unpin' : 'Pin'} player">
                    ${isPinned ? '📌' : '📍'}
                </button>
            </td>
            <td>${rankBadge}</td>
            <td><span class="player-name">${player.player}</span></td>
            <td>${modelDisplay}</td>
            <td>${player.ratingMu.toFixed(2)}</td>
            <td>${player.ratingSigma.toFixed(2)}</td>
            <td>${player.wins}</td>
            <td>${player.draws}</td>
            <td>${player.losses}</td>
            <td>${player.games}</td>
            <td>
                <div class="win-rate-bar">
                    <span>${winRatePercent}%</span>
                    <div class="win-rate-bar-container">
                        <div class="win-rate-bar-fill" style="width: ${winRatePercent}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn" onclick="showPlayerDetails('${player.player}')">View</button>
                    <button class="btn btn-compare" onclick="togglePlayerComparison('${player.player}')">Compare</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get rank badge HTML
function getRankBadge(rank) {
    if (rank === 1) {
        return '<span class="rank-badge gold">1</span>';
    } else if (rank === 2) {
        return '<span class="rank-badge silver">2</span>';
    } else if (rank === 3) {
        return '<span class="rank-badge bronze">3</span>';
    } else {
        return `<span class="rank-badge default">${rank}</span>`;
    }
}

// Show player details modal
function showPlayerDetails(playerName) {
    const player = allPlayers.find(p => p.player === playerName);
    if (!player) return;
    
    const modal = document.getElementById('playerModal');
    document.getElementById('modalPlayerName').textContent = player.player;
    
    const statsHtml = `
        <div class="modal-stat-item">
            <div class="modal-stat-value">#${player.rank}</div>
            <div class="modal-stat-label">Rank</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.ratingMu.toFixed(2)}</div>
            <div class="modal-stat-label">Rating (μ)</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.ratingSigma.toFixed(2)}</div>
            <div class="modal-stat-label">Uncertainty (σ)</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.wins}</div>
            <div class="modal-stat-label">Wins</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.draws}</div>
            <div class="modal-stat-label">Draws</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.losses}</div>
            <div class="modal-stat-label">Losses</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${player.games}</div>
            <div class="modal-stat-label">Total Games</div>
        </div>
        <div class="modal-stat-item">
            <div class="modal-stat-value">${(player.winRate * 100).toFixed(1)}%</div>
            <div class="modal-stat-label">Win Rate</div>
        </div>
    `;
    
    document.getElementById('modalPlayerStats').innerHTML = statsHtml;
    
    // Display model information
    const config = playerConfigs[playerName] || { model: { provider: 'Unknown', name: 'Not available' } };
    const modelHtml = `
        <h3>Model Information</h3>
        <div style="margin-bottom: 10px;">
            <strong>Provider:</strong> <span class="model-info">${config.model.provider || 'Unknown'}</span>
        </div>
        <div>
            <strong>Model:</strong> <span class="model-info">${config.model.name || 'Not available'}</span>
        </div>
    `;
    document.getElementById('modalPlayerModel').innerHTML = modelHtml;
    
    // Display prompts
    const promptsHtml = `
        <h3>Prompts</h3>
        ${config.systemPrompt ? `
            <div class="prompt-box">
                <h4>System Prompt</h4>
                <pre>${config.systemPrompt}</pre>
            </div>
        ` : ''}
        ${config.stepWisePrompt ? `
            <div class="prompt-box">
                <h4>Step-wise Prompt</h4>
                <pre>${config.stepWisePrompt}</pre>
            </div>
        ` : ''}
        ${!config.systemPrompt && !config.stepWisePrompt ? `
            <p style="color: var(--text-secondary);">Prompts not available. Config file may not be accessible due to CORS restrictions.</p>
        ` : ''}
    `;
    document.getElementById('modalPlayerPrompts').innerHTML = promptsHtml;
    
    modal.style.display = 'block';
}

// Toggle player comparison
function togglePlayerComparison(playerName) {
    const player = allPlayers.find(p => p.player === playerName);
    if (!player) return;
    
    const index = selectedPlayers.findIndex(p => p.player === playerName);
    if (index > -1) {
        selectedPlayers.splice(index, 1);
    } else {
        if (selectedPlayers.length >= 3) {
            alert('You can compare up to 3 players at once. Please remove one first.');
            return;
        }
        selectedPlayers.push(player);
    }
    
    updateComparisonModal();
}

// Update comparison modal
function updateComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    const content = document.getElementById('comparisonContent');
    
    if (selectedPlayers.length === 0) {
        content.innerHTML = '<p>Select players to compare using the "Compare" button.</p>';
        modal.style.display = 'none';
        return;
    }
    
    let html = '';
    selectedPlayers.forEach(player => {
        html += `
            <div class="comparison-player">
                <h3>${player.player}</h3>
                <div class="comparison-stat">
                    <span>Rank:</span>
                    <strong>#${player.rank}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Rating (μ):</span>
                    <strong>${player.ratingMu.toFixed(2)}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Uncertainty (σ):</span>
                    <strong>${player.ratingSigma.toFixed(2)}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Wins:</span>
                    <strong>${player.wins}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Draws:</span>
                    <strong>${player.draws}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Losses:</span>
                    <strong>${player.losses}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Games:</span>
                    <strong>${player.games}</strong>
                </div>
                <div class="comparison-stat">
                    <span>Win Rate:</span>
                    <strong>${(player.winRate * 100).toFixed(1)}%</strong>
                </div>
                <button class="btn" style="margin-top: 10px; width: 100%;" onclick="removeFromComparison('${player.player}')">Remove</button>
            </div>
        `;
    });
    
    content.innerHTML = html;
    modal.style.display = 'block';
}

// Remove player from comparison
function removeFromComparison(playerName) {
    selectedPlayers = selectedPlayers.filter(p => p.player !== playerName);
    updateComparisonModal();
}

// Render charts
function renderCharts() {
    renderWinRateChart();
    renderRatingChart();
    renderGameStatsChart();
}

// Win Rate Distribution Chart
function renderWinRateChart() {
    const ctx = document.getElementById('winRateChart').getContext('2d');
    
    // Create bins for win rate distribution
    const bins = [0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const binLabels = ['0-20%', '20-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'];
    const binCounts = new Array(bins.length - 1).fill(0);
    
    filteredPlayers.forEach(player => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (player.winRate >= bins[i] && player.winRate < bins[i + 1]) {
                binCounts[i]++;
                break;
            }
        }
        if (player.winRate === 1.0) {
            binCounts[binCounts.length - 1]++;
        }
    });
    
    if (winRateChart) {
        winRateChart.destroy();
    }
    
    winRateChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Number of Players',
                data: binCounts,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Rating Distribution Chart
function renderRatingChart() {
    const ctx = document.getElementById('ratingChart').getContext('2d');
    
    const ratings = filteredPlayers.map(p => p.ratingMu).sort((a, b) => a - b);
    
    if (ratingChart) {
        ratingChart.destroy();
    }
    
    ratingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredPlayers.map((_, i) => i + 1),
            datasets: [{
                label: 'Rating (μ)',
                data: ratings,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Player Rank'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rating'
                    }
                }
            }
        }
    });
}

// Game Statistics Chart
function renderGameStatsChart() {
    const ctx = document.getElementById('gameStatsChart').getContext('2d');
    
    const totalWins = filteredPlayers.reduce((sum, p) => sum + p.wins, 0);
    const totalDraws = filteredPlayers.reduce((sum, p) => sum + p.draws, 0);
    const totalLosses = filteredPlayers.reduce((sum, p) => sum + p.losses, 0);
    
    if (gameStatsChart) {
        gameStatsChart.destroy();
    }
    
    gameStatsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Draws', 'Losses'],
            datasets: [{
                data: [totalWins, totalDraws, totalLosses],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}


// Export to CSV
function exportToCSV() {
    const headers = ['Rank', 'Player', 'Rating_Mu', 'Rating_Sigma', 'Wins', 'Draws', 'Losses', 'Games', 'Win_Rate'];
    const rows = filteredPlayers.map(p => [
        p.rank,
        p.player,
        p.ratingMu.toFixed(2),
        p.ratingSigma.toFixed(2),
        p.wins,
        p.draws,
        p.losses,
        p.games,
        p.winRate.toFixed(3)
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

