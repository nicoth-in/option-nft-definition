

async function getNFTsByOwner(ownerAddrStr) {
    let url = `https://ethereum-api-dev.rarible.org/v0.1/nft/items/byOwner?owner=${ownerAddrStr}&size=10`;
    let response = await fetch(url);
    return await response.json();
}

export { getNFTsByOwner }