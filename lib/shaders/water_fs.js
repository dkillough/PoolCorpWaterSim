// fragment shader for the water

const fs = `
precision highp float;

uniform vec4 color;
uniform sampler2D sampler;
uniform sampler2D sampler2;

uniform float time;

varying vec3 vLighting;
varying vec2 vTexCoord;

void main() {
  // gl_FragColor = vec4(vLighting * color.rgb, color.a);
  vec4 color1 = texture2D(sampler, vec2(vTexCoord.x + time/50.0, vTexCoord.y + time/50.0));
  vec4 color2 = texture2D(sampler2, vec2(vTexCoord.x + time/50.0, vTexCoord.y + time/50.0));
  gl_FragColor = vec4(vLighting * ((color1.xyz + color.xyz)/2.0), color.w);
}

`;

// const fs = `
// #define EPSILON 0.001
// precision highp float;
// uniform sampler2D sampler;
// uniform sampler2D sampler2;

// uniform float XMIN;
// uniform float XMAX;
// uniform float YMIN;
// uniform float YMAX;
// uniform float ZMIN;
// uniform float ZMAX;

// varying vec3 position;
// varying vec3 waveNormals;
// varying vec3 vLighting;
// varying vec3 vTexCoord;

// struct intersection {
// 	bool hit;
// 	float distance;
// };

// intersection intersect_box(vec3 bmin, vec3 bmax, vec3 ray_origin, vec3 ray_direction) {
// 	intersection result;
// 	result.hit = false;
// 	vec3 dirfrac;

// 	// todo: precompute these on vertex shader
// 	dirfrac.x = 1.0 / ray_direction.x;
// 	dirfrac.y = 1.0 / ray_direction.y; 
// 	dirfrac.z = 1.0 / ray_direction.z;

// 	float t1 = (bmin.x - ray_origin.x)*dirfrac.x;
// 	float t2 = (bmax.x - ray_origin.x)*dirfrac.x;
// 	float t3 = (bmin.y - ray_origin.y)*dirfrac.y;
// 	float t4 = (bmax.y - ray_origin.y)*dirfrac.y;
// 	float t5 = (bmin.z - ray_origin.z)*dirfrac.z;
// 	float t6 = (bmax.z - ray_origin.z)*dirfrac.z;

// 	float tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
// 	float tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

// 	// if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
// 	if (tmax < 0.0) return result; // miss

// 	// if tmin > tmax, ray doesn't intersect AABB
// 	if (tmin > tmax) return result; // miss

// 	result.hit = true;
// 	result.distance = tmin;
// 	return result;
// }

// vec3 calcNormal(vec3 iPosition) {
// 	if (iPosition.x < XMIN + EPSILON || iPosition.x > XMAX - EPSILON) {
// 		return vec3(-1,0,0) * sign(iPosition.x - 0.5*XMIN - 0.5*XMAX);
// 	} else if (iPosition.y < YMIN + EPSILON || iPosition.y > YMAX - EPSILON) {
// 		return vec3(0,-1,0) * sign(iPosition.y - 0.5*YMIN - 0.5*YMAX);
// 	} else if (iPosition.z < ZMIN + EPSILON || iPosition.z > ZMAX - EPSILON) {
// 		return vec3(0,0,-1) * sign(iPosition.z - 0.5*ZMIN - 0.5*ZMAX);
// 	} else {
// 		return vec3(0);
// 	}
// }

// vec3 getColor(vec2 texCoord) {
// 	return texture2D(sampler, texCoord).xyz;
// }

// void main()	{
// 	vec3 viewDirection = normalize(cameraPosition - position);

// 	// refraction
// 	float m = (1.0/(1.33));
// 	float c1 = dot(waveNormals, viewDirection);
// 	float c2 = sign(c1) * sqrt(1.0 - m*m*(1.0 - c1*c1));
// 	vec3 refractDirection = m*viewDirection - 1.0*(m*c1 - c2)*waveNormals;

// 	float fresnel = 0.5 * (1.33*c1 - c2)*(1.33*c1 - c2)/((1.33*c1 + c2)*(1.33*c1 + c2))+ 0.5 * (c2 - 1.33*c1)*(c2 - 1.33*c1)/((c2 + 1.33*c1)*(c2 + 1.33*c1));

// 	intersection ib = intersect_box(vec3(XMIN, YMIN, ZMIN), vec3(XMAX, YMAX, ZMAX), position, refractDirection);
	
//   	vec3 refractColor;
// 	if (ib.hit) {
// 		vec3 iPosition = position + ib.distance * refractDirection;
// 		vec3 calcNormal = calcNormal(iPosition);
// 		refractColor = getColor(vTexCoord) * vLighting;
// 	} else {
// 		// ray should always hit, but here's a failsafe
// 		refractColor = vec3(1, 0, 0);
// 	}

// 	// reflection
// 	vec3 reflectDirection = normalize(position - cameraPosition);
// 	reflectDirection -= 2.0 * dot(reflectDirection, waveNormals) * waveNormals;
// 	vec3 reflectionColor;
// 	ib = intersect_box(vec3(XMIN, YMIN, ZMIN), vec3(XMAX, YMAX, ZMAX), position, -reflectDirection);
// 	if (ib.hit) {
// 		vec3 iPosition = position - ib.distance * reflectDirection;
// 		if (iPosition.y >= YMAX - EPSILON) {
// 			reflectionColor = texture2D(sampler2, vec3(reflectDirection.x, reflectDirection.y, reflectDirection.z)).xyz;
// 		} else {
// 			vec3 calcNormal = calcNormal(iPosition);
// 			reflectionColor = getColor(vTexCoord) * vLighting;
// 		}
// 	} else {
// 		reflectionColor = vec3(1,0,0); // debug
// 	}

// 	// specular
// 	vec3 specularColor = vec3(1.0) * max(0.0, pow(dot(waveNormals, viewDirection), 1.5));
// 	float specularIntensity = 0.2;

// 	// final color
// 	gl_FragColor = vec4(
// 		(1.0 - specularIntensity) * fresnel * reflectionColor +
// 		(1.0 - specularIntensity) * (1.0-fresnel) * refractColor +
// 		specularIntensity * specularColor, 1.0);
// }
// `

export default fs;

