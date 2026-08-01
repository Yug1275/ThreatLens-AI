"""
IOC Correlator — Cross-investigation IOC correlation engine.
Aggregates IOCs across all investigation types and identifies patterns.
"""
import logging
from typing import Any
from collections import defaultdict

logger = logging.getLogger(__name__)


def aggregate_iocs_from_investigations(investigations: list[dict]) -> list[dict]:
    """
    Extract and deduplicate IOCs from multiple investigation result_data objects.
    Returns a list of IOC dicts with source investigation info.
    """
    iocs = []
    seen = set()

    for inv in investigations:
        result_data = inv.get("result_data") or {}
        inv_id = inv.get("id", "unknown")
        inv_type = inv.get("type", "unknown")
        inv_target = inv.get("target", "unknown")
        threat_score = inv.get("threat_score", 0)

        # Different investigation types store IOCs in different fields
        ioc_sources = [
            result_data.get("iocs", []),
            result_data.get("extracted_iocs", []),
        ]

        for ioc_list in ioc_sources:
            if not isinstance(ioc_list, list):
                continue
            for ioc in ioc_list:
                if not isinstance(ioc, dict):
                    continue
                ioc_value = ioc.get("value", "")
                ioc_type = ioc.get("type", "Unknown")
                key = f"{inv_id}:{ioc_type}:{ioc_value}"

                if key not in seen and ioc_value:
                    seen.add(key)
                    iocs.append({
                        "type": ioc_type,
                        "value": ioc_value,
                        "description": ioc.get("description", ""),
                        "source": f"{inv_type} investigation: {inv_target}",
                        "source_investigation_id": inv_id,
                        "threat_score": threat_score,
                    })

        # Also extract domain, IP, email from result_data fields
        domain = result_data.get("domain") or result_data.get("sender_domain")
        if domain and domain != "Not Provided":
            key = f"{inv_id}:Domain:{domain}"
            if key not in seen:
                seen.add(key)
                iocs.append({
                    "type": "Domain",
                    "value": domain,
                    "source": f"{inv_type} investigation: {inv_target}",
                    "source_investigation_id": inv_id,
                    "threat_score": threat_score,
                })

        # DNS IPs
        dns = result_data.get("dns", {})
        if isinstance(dns, dict):
            for ip in dns.get("A", []):
                key = f"{inv_id}:IP:{ip}"
                if key not in seen:
                    seen.add(key)
                    iocs.append({
                        "type": "IP",
                        "value": ip,
                        "source": f"{inv_type} investigation: {inv_target}",
                        "source_investigation_id": inv_id,
                        "threat_score": threat_score,
                    })

    return iocs


def find_basic_correlations(iocs: list[dict]) -> dict:
    """
    Perform basic deterministic correlation analysis without AI.
    Groups IOCs by common attributes and identifies overlaps.
    """
    # Group by type
    by_type = defaultdict(list)
    for ioc in iocs:
        by_type[ioc["type"]].append(ioc)

    # Group by domain (extract domain from URLs and emails)
    domain_map = defaultdict(list)
    for ioc in iocs:
        domain = _extract_domain(ioc["value"], ioc["type"])
        if domain:
            domain_map[domain].append(ioc)

    # Find clusters (IOCs that share a domain)
    clusters = []
    for domain, related_iocs in domain_map.items():
        if len(related_iocs) >= 2:
            clusters.append({
                "cluster_name": f"Infrastructure cluster: {domain}",
                "pivot": domain,
                "iocs": [{"type": ioc["type"], "value": ioc["value"]} for ioc in related_iocs],
                "relationship": f"Shared domain infrastructure: {domain}",
                "investigation_count": len(set(ioc.get("source_investigation_id") for ioc in related_iocs)),
            })

    return {
        "total_iocs": len(iocs),
        "by_type": {k: len(v) for k, v in by_type.items()},
        "clusters": clusters,
        "high_risk_iocs": [
            ioc for ioc in iocs if (ioc.get("threat_score") or 0) > 60
        ],
    }


def _extract_domain(value: str, ioc_type: str) -> str | None:
    """Extract a domain from an IOC value for correlation purposes."""
    if ioc_type == "Domain":
        return value.lower()
    elif ioc_type == "URL":
        try:
            from urllib.parse import urlparse
            parsed = urlparse(value)
            return (parsed.hostname or "").lower()
        except Exception:
            return None
    elif ioc_type == "Email":
        if "@" in value:
            return value.split("@")[-1].lower()
    return None
