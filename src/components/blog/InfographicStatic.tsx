import type { BlogInfographic } from "@/data/blogPosts";

/**
 * Plain, hook-free markup of an infographic. The prerenderer writes this into
 * the static page so crawlers read every figure without running any script.
 */
export function InfographicStatic({ graphic }: { graphic: BlogInfographic }) {
  return (
    <figure>
      <figcaption>
        {graphic.title}
        {"illustrative" in graphic && graphic.illustrative ? " (illustrative figures)" : ""}
      </figcaption>
      {graphic.kind === "steps" && (
        <ol>
          {graphic.items.map((item) => (
            <li key={item.label}>
              {item.label}
              {item.detail ? `: ${item.detail}` : ""}
            </li>
          ))}
        </ol>
      )}
      {graphic.kind === "bars" && (
        <ul>
          {graphic.items.map((item) => (
            <li key={item.label}>
              {item.label}: {item.display}
              {item.note ? ` (${item.note})` : ""}
            </li>
          ))}
        </ul>
      )}
      {graphic.kind === "funnel" && (
        <ol>
          {graphic.stages.map((stage) => (
            <li key={stage.label}>
              {stage.label}: {stage.display}
            </li>
          ))}
        </ol>
      )}
      {graphic.kind === "compare" &&
        graphic.columns.map((column) => (
          <div key={column.heading}>
            <p>{column.heading}</p>
            <ul>
              {column.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      {graphic.kind === "stats" && (
        <dl>
          {graphic.items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {graphic.note && <p>{graphic.note}</p>}
    </figure>
  );
}
